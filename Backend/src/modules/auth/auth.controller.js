import autSvc from "./auth.service.js";
import cloudianarySvc from "../../services/cloudinary.services.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { AppConfig } from "../../config/constants.js";
import { randomStringGenerator } from "../../utils/helper.js";

class AuthController {
    
    registerUser = async (req, res, next) => {
        let userData;
        try {
            const existingUser = await autSvc.getSingleUserByFilter({ email: req.body.email });
            if (existingUser) {
                if (req.file && req.file.path) {
                    cloudianarySvc.removeLocalFile(req.file.path);
                }
                throw {
                    code: 400,
                    message: "A user with this email address already exists.",
                    status: "EMAIL_ALREADY_EXISTS"
                };
            }

            userData = await autSvc.userRegisterDataTrans(req);
            const userObj = await autSvc.userStore(userData);
           
            autSvc.notifyActivationEmail({
                fullName: userObj.fullName, 
                email: userObj.email,
                activationToken: userObj.activationToken
            }).catch((err) => {
                console.error("Failed to send activation email:", err);
            });

            res.json({
                data: {
                    user: autSvc.publicUserProfile(userObj),
                },
                message: "User registered successfully",
                status: "Register_Success",
                option: null
            });

        } catch (exception) {
            // ✅ If failure happened BEFORE Cloudinary upload, local file still exists — delete it
            if (req.file && req.file.path) {
                cloudianarySvc.removeLocalFile(req.file.path);
            }

            // ✅ If failure happened AFTER Cloudinary upload, roll it back
            if (userData && userData.image_id) {
                await cloudianarySvc.deleteFile(userData.image_id);
            }

            next(exception);
        }
    }

    activateUser = async (req, res, next) => {
    try {
        let token = req.params.token || null;
        if (!token) {
            throw {
                code: 422,
                message: "Activation token is expected",
                status: "ACTIVATION_TOKEN_MISSING"
            }
        }
        const associatedUser = await autSvc.getSingleUserByFilter({
            activationToken: token
        })
        if (!associatedUser) {
            throw {
                code: 422,
                message: "Token already used or does not exists",
                status: "ACTIVATION_TOKEN_NOT_FOUND"
            }
        }
        let userData = {
            status: true,
            activationToken: null
        }
        await autSvc.updateSingleUserByFilter({ _id: associatedUser._id }, userData)

        // ✅ Redirect to frontend login page after successful activation
        res.redirect(`${AppConfig.frontend_Url}/loginpage?activated=true`);

    } catch (exception) {
        // ✅ Redirect to frontend error page if activation fails
        if (exception.status === "ACTIVATION_TOKEN_NOT_FOUND" || exception.status === "ACTIVATION_TOKEN_MISSING") {
            return res.redirect(`${AppConfig.frontend_Url}/login?activated=false`);
        }
        next(exception)
    }
}

    loginUser = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await autSvc.getSingleUserByFilter({ email: email }, "+password")

            if (!user) {
                throw {
                    code: 422,
                    message: "User Does not exist",
                    status: "User_Not_Found"
                }
            } else if (!bcrypt.compareSync(password, user.password)) {
                throw {
                    code: 403,
                    message: "Credential does not match",
                    status: "CREDENTIAL_NOT_MATCHED"
                }
            } else if (user.status === false) {
                throw {
                    code: 403,
                    message: "Your account is not activated. Please verify your email.",
                    status: "ACCOUNT_NOT_ACTIVATED"
                };
            } else {
                let accessToken = jwt.sign({
                    sub: user._id,
                    type: "access"
                }, AppConfig.jwtSecret, {
                    expiresIn: '7d'
                })
                let refreshToken = jwt.sign({
                    sub: user._id,
                    type: "refresh"
                }, AppConfig.jwtSecret, {
                    expiresIn: "30d"
                });
                res.json({
                    data: {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        user: autSvc.publicUserProfile(user)
                    },
                    message: "Login Successfully",
                    status: "LOGIN_SUCCESS",
                    option: null
                })
            }
        } catch (exception) {
            next(exception)
        }
    }

    getMyProfile = async (req, res, next) => {
        res.json({
            data: req.authUser,
            status: "LOGGEDIN_USER",
            message: "Your Profile",
            option: null
        })
    }

    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = await autSvc.getSingleUserByFilter({ email: email });

            if (!user) {
                return next({
                    code: 400,
                    detail: { email: "User email has not been registered yet" },
                    message: "User not found",
                    status: "USER_NOT_FOUND"
                });
            }
            if (user.status === false) {
                return next({
                    code: 403, 
                    message: "Your account is not activated. Please verify your email before resetting your password.",
                    status: "ACCOUNT_NOT_ACTIVATED"
                });
            }

            let updateData = {
                forgotPasswordToken: randomStringGenerator(100),
                expireToken: new Date(Date.now() + 60 * 60 * 1000)
            };

            await autSvc.updateSingleUserByFilter({ email: email }, updateData);
            
            await autSvc.notifyForgotPassword({
                fullName: user.fullName || 'User', 
                email: user.email,
                resetToken: updateData.forgotPasswordToken
            });

            res.json({
                data: null,
                message: 'A link has been sent to your registered email to reset your password',
                status: "FORGETPASSWORD_LINK_SEND",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    verifyFogetPasswordToken = async (req, res, next) => {
        try {
            let token = req.params.token;
            let user = await autSvc.getSingleUserByFilter({ forgotPasswordToken: token });

            if (!user) {
                return next({
                    code: 422,
                    message: "Token does not exist or is already used",
                    status: "TOKEN_NOT_FOUND"
                });
            }
            if (!user.expireToken) {
                return next({
                    code: 400,
                    message: "Token expiry time is missing from the database.",
                    status: "INVALID_TOKEN_DATA"
                });
            }

            const tokenExpiry = new Date(user.expireToken).getTime();
            if (Date.now() > tokenExpiry) {
                return next({
                    code: 422,
                    message: "Password reset token expired",
                    status: "PASSWORD_RESET_TOKEN_EXPIRED"
                });
            }

            const verifyToken = randomStringGenerator(100);
            await autSvc.updateSingleUserByFilter({ _id: user._id }, {
                forgotPasswordToken: verifyToken,
                expireToken: new Date(Date.now() + 30 * 60 * 1000)
            });

            res.redirect(`${AppConfig.frontend_Url}/reset-password?token=${verifyToken}`);

        } catch (exception) {
            next(exception);
        }
    }

    resetPassword = async (req, res, next) => {
        try {
            const { token, password } = req.body;
            const user = await autSvc.getSingleUserByFilter({ forgotPasswordToken: token }, "+password")
            
            if (!user) {
                return next({
                    code: 422,
                    message: "Token does not exist or already used",
                    status: "TOKEN_NOT_FOUND"
                })
            }
            if (bcrypt.compareSync(password, user.password)) {
                return next({
                    code: 400,
                    message: "Your new password cannot be exactly the same as your old password. Please choose a different password.",
                    status: "PASSWORD_UNCHANGED"
                });
            }
            const data = {
                forgotPasswordToken: null,
                expireToken: null,
                password: bcrypt.hashSync(password, 12),
                status: true
            }
            
            await autSvc.updateSingleUserByFilter({ _id: user._id }, data)
            
            res.status(200).json({
                data: null,
                message: "Your password has been reset successfully. Please log in to continue",
                status: "PASSWORD_RESET_SUCCESSFUL",
                option: null
            })
        } catch (exception) {
            next(exception)
        }
    }

    verifyUserPassword = async (req, res, next) => {
        try {
            const { password } = req.body;
            const user = await autSvc.getSingleUserByFilter({ _id: req.authUser._id }, "+password");

            if (!user) {
                throw {
                    code: 404,
                    message: "User context not found.",
                    status: "USER_NOT_FOUND"
                };
            }

            const isMatched = bcrypt.compareSync(password, user.password);

            if (!isMatched) {
                throw {
                    code: 401,
                    message: "Verification failed. The security password you entered is incorrect.",
                    status: "PASSWORD_NOT_MATCHED"
                };
            }

            res.json({
                data: null,
                message: "Password verification successful",
                success: true,
                status: "VERIFICATION_SUCCESS"
            });

        } catch (exception) {
            next(exception);
        }
    }
}

const authCtr = new AuthController()
export default authCtr