export const createUserEmailTemplate = (userId: string, password: string) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User ID and Password</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

  <div style="max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333;">User ID and Password</h1>
      <p style="color: #666;">Dear User,</p>
      <p style="color: #666;">Your account credentials are provided below:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px;">
          <p style="font-weight: bold; margin: 0; color: #333;">User ID: <span style="font-weight: normal;">${userId}</span></p>
          <p style="font-weight: bold; margin: 0; color: #333;">Password: <span style="font-weight: normal;">${password}</span></p>
      </div>
      <p style="color: #666;">Please keep this information secure and do not share it with anyone.</p>
      <p style="color: #666;">You can change your password from here <a href="${process.env.FRONTEND_URL}/reset-password"> click </a> </p>
      <p style="color: #666;">If you have any questions or concerns, feel free to contact us.</p>
      <p style="color: #666;">Thank you!</p>
  </div>
  </body>
  </html>`;
};
