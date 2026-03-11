export const passwordUpdateEmailTemplate = (userId: string, newPassword: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Updated</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

    <div style="max-width: 600px; margin: 20px auto; background-color: #fff; padding: 20px; border-radius: 8px; 
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

        <p style="color: #666;">Dear User,</p>

        <p style="color: #666;">Your password has been successfully updated. Please use the credentials provided below to log in:</p>

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px;">
        <p style="font-weight: bold; margin: 0; color: #333;">User ID: 
            <span style="font-weight: normal;">${userId}</span>
        </p>
        <p style="font-weight: bold; margin: 0; color: #333;">New Password: 
            <span style="font-weight: normal;">${newPassword}</span>
        </p>
    </div>
    
    <p style="color: #666;">Keep this information secure and do not share it.</p>
    
    <p style="color: #666;">If you did not request this change, please contact our support team immediately.</p>
    
    <p style="color: #666;">Thank you!</p>
    </div>
    
    </body>
    </html>
    `;
};
