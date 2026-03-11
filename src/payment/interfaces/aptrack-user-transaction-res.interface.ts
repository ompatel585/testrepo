export interface IAptrackUserTransactionRes {
  Transaction_Id: string;
  Transaction_date: string; // Format: "M/D/YYYY hh:mm:ss A"
  Bank_Ref_No: string;
  Payment_Gateway: string;
  Transaction_Amount: string;
  Transaction_Status: string;
  Student_ID: string;
  Student_Name: string;
  Receipt_No: string;
  ReceiptHeaderId: number;
  Receipt_Date: string; // Format: "M/D/YYYY hh:mm:ss A"
  Receipt_Amount: string;
  Receipt_Status: string;
  Invoice_No: string;
  PaymentMode_Name: string;
}

export interface IFormattedUserTransaction {
  transactionId: string;
  transactionDate: string; // Format: "DD-MM-YYYY HH:mm:ss"
  bankRefNo: string;
  PG: string;
  transactionAmount: string;
  transactionStatus: string;
  userId: string;
  userName: string;
  receiptNo: string;
  receiptHeaderId: number;
  receiptDate: string; // Format: "DD-MM-YYYY HH:mm:ss"
  receiptAmount: string;
  receiptStatus: string;
  invoiceNo: string;
  paymentModeName: string;
}
