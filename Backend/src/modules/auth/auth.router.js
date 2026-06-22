import { Router } from "express";
import authCtr from "./auth.controller.js";
import { bodyValidator } from "../../middelware/request.validator.js";
import { ForgetPasswordRequestDTO, LoginDTO, RegisterUserDTO, VerifyPasswordDTO } from "./auth.validator.js";
import { uploader } from "../../middelware/file-handeling.middleware.js";
import allowUser from "../../middelware/auth.middleware.js";
const authRouter = Router();

authRouter.post('/auth/register', bodyValidator(RegisterUserDTO), uploader().single('image'), authCtr.registerUser)

authRouter.get('/auth/activater/:token', authCtr.activateUser);
authRouter.post('/auth/me',allowUser(),authCtr.getMyProfile);
authRouter.post('/auth/login',bodyValidator(LoginDTO),authCtr.loginUser);
authRouter.post('/auth/forgot_password',bodyValidator(ForgetPasswordRequestDTO),authCtr.forgotPassword);
authRouter.get('/auth/verify-token/:token',authCtr.verifyFogetPasswordToken)
authRouter.patch('/auth/reset-password',authCtr.resetPassword);

authRouter.post('/auth/verify-password', allowUser(), bodyValidator(VerifyPasswordDTO), authCtr.verifyUserPassword);

export default authRouter;