export interface IAptrackUserPaymentRes {
  BCNo: string;
  BCDate: string;
  BCStatus: string;
  BCAmount: string;
  ReceiptAmount: string;
  PendingAmount: string;
  FeeStatus: string;
  Invoice_Header_ID: string;
  Enquiry_Regn_ID: string;
  SAP_Customer_Id: string;
  Student_Status: string;
  OutstandingAmount: string;
  // add more as per need
}

export interface IFormattedUserPayment {
  BCNo: string;
  BCDate: string;
  BCActiveStatus: string;
  BCAmount: number;
  totalPaidAmount: number;
  pendingAmount: number;
  outstandingAmount: number;
  BCFeeStatus: string;
  monthlyFeesStatus: MonthlyFeesStatusType;
  Invoice_Header_ID: string;
}

export type MonthlyFeesStatusType = 'Paid' | 'Pending';
