export const studentSupportRequestTemplate = ({
  userName,
  userMobile,
  userEmail,
  userId,
  userCourses,
  complaintCategory,
  userBrand,
  userZone,
  userRegion,
  userArea,
  userCenter,
  complaintDescription,
}: {
  userName: string;
  userMobile: string;
  userEmail: string;
  userId: string | number;
  userCourses: string;
  complaintCategory: string;
  userBrand: string;
  userZone: string;
  userRegion: string;
  userArea: string;
  userCenter: string;
  complaintDescription: string;
}) => {
  return `
  <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Complaint Details</title>
    </head>
    <body style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <p>Dear Team,</p>

        <table
        width="100%"
        cellpadding="8"
        cellspacing="0"
        border="1"
        style="border-collapse: collapse; font-size: 14px;"
        >
        <tr>
            <td style="font-weight: bold; width: 20%;">Student Name</td>
            <td>${userName}</td>
        </tr>
        <tr>
            <td stylen}</td="font-weight: bold;">Mobile Number</td>
            <td>${userMobile}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Email ID</td>
            <td>${userEmail}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Student Id as on Invoice</td>
            <td>${userId}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Student's Course</td>
            <td>${userCourses}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Complaint Category</td>
            <td>${complaintCategory}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Brand</td>
            <td>${userBrand}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Zone</td>
            <td>${userZone}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Region</td>
            <td>${userRegion}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Area</td>
            <td>${userArea}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Center</td>
            <td>${userCenter}</td>
        </tr>
        </table>

        <br />

        <h2 style="margin: 0 0 8px 0;">More About Complaint</h2>

        <p style="margin: 4px 0;">
        <strong>Subject:</strong>
        Issue in ${complaintCategory}
        </p>

        <br />

        <p style="margin: 4px 0;">
        <br />
        ${complaintDescription}
        </p>

        <br />
        <p>Regards,<br />Support Team</p>
    </body>
    </html>`;
};
