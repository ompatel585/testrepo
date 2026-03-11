export const emailVerifyOtpTemplate = (otp: string) => {
  return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Email</title>
            </head>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                    <h4 style="color: #333;">${otp} is your OTP to verify your email on Aptech ProConnect.</h4>
                    <p style="color: #333;">It is valid for 10 minutes.</p>
                    <p style="color: #333;">Do not share this OTP with anyone.</p>
                    <div style="margin-top: 20px; text-align: center; color: #999;">
                        <p>Please ignore this message if you did not request the code.</p>
                    </div>
                </div>
            </body>
            </html>`;
};

export const emailChangeOtpTemplate = (otp: string) => {
  return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OTP Email</title>
            </head>
            <body>
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                    <h4 style="color: #333;">${otp} is your OTP to change your email on Aptech ProConnect.</h4>
                    <p style="color: #333;">It is valid for 10 minutes.</p>
                    <p style="color: #333;">Do not share this OTP with anyone.</p>
                    <div style="margin-top: 20px; text-align: center; color: #999;">
                        <p>Please ignore this message if you did not request the code.</p>
                    </div>
                </div>
            </body>
            </html>`;
};

export const forgotPasswordOtpEmailTemplate = (otp: string) => {
  return `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>OTP Email</title>
              </head>
              <body>
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                      <h4 style="color: #333;">${otp} is your OTP to reset your email on Aptech ProConnect.</h4>
                      <p style="color: #333;">It is valid for 10 minutes.</p>
                      <p style="color: #333;">Do not share this OTP with anyone.</p>
                      <div style="margin-top: 20px; text-align: center; color: #999;">
                          <p>Please ignore this message if you did not request the code.</p>
                      </div>
                  </div>
              </body>
              </html>`;
};

export const WCELStudentSubmissionOtpEmailTemplate = (
  category: string,
  event_name: string,
) => {
  return `<!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>WCEL Artwork Successful Submission!</title>
              </head>
              <body>
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                      <h4 style="color: #333;">Your artwork successfuly submitted under ${category} category.</h4>
                      <p style="color: #333;">Thank you for submitting your work. We wish you all the best for the evaluation process.</p>
                      <div style="margin-top: 20px; text-align: center; color: #999;">
                          <p>Please ignore this message if you did not submitted any artwork for ${event_name} competition.</p>
                      </div>
                  </div>
              </body>
              </html>`;
};
