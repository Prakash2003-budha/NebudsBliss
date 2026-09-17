import { EmailConfig } from "../config/constants.js"

const RESEND_API_URL = "https://api.resend.com/emails";

class EmailService {
    #apiKey
    #fromAddress

    constructor() {
        this.#apiKey = EmailConfig.apiKey;
        this.#fromAddress = EmailConfig.fromAddress;

        if (!this.#apiKey) {
            console.log("WARNING: no Resend API key configured (RESEND_API_KEY / SMTP_PASSWORD is empty). Emails will fail to send.");
        }
        console.log(`Email service configured: provider=resend, from=${this.#fromAddress || "(missing)"}, apiKey=${this.#apiKey ? "present" : "missing"}`);
    }

    // Sends over Resend's HTTPS API rather than raw SMTP, because SMTP ports
    // (25/465/587) are blocked outbound on Render's free tier while normal
    // HTTPS (443) is not. Signature kept identical to the old nodemailer-based
    // implementation so callers (auth.service.js, order.controller.js) don't
    // need any changes.
    sendEmail = async ({ to, sub, message }) => {
        try {
            const response = await fetch(RESEND_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.#apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    from: this.#fromAddress,
                    to: [to],
                    subject: sub,
                    html: message
                })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errName = data?.name || "";
                const isQuotaExceeded = response.status === 429 &&
                    /quota_exceeded/i.test(errName);

                const error = new Error(
                    isQuotaExceeded
                        ? "The email provider daily/monthly sending quota has been exceeded. Wait for the quota to reset or upgrade your Resend plan."
                        : data?.message || `Resend API request failed with status ${response.status}`
                );

                error.status = isQuotaExceeded ? "EMAIL_PROVIDER_LIMIT" : "EMAIL_SEND_FAILED";
                error.code = response.status;
                throw error;
            }

            return data;
        } catch (exception) {
            console.error("Email delivery failed:", exception);

            if (exception.status) {
                throw exception;
            }

            const error = new Error(exception?.message || "sending email failed");
            error.status = "EMAIL_SEND_FAILED";
            error.code = exception?.code;
            throw error;
        }
    }
}

const emailSvc = new EmailService();
export default emailSvc;