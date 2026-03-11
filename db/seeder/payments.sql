-- paymentOption
insert into payment_option
    (name, "groupLevel", code, status, "iconUrl")
values
    ('UPI', 1, 'upi', 1, 'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/payment-icons/payment-upi.png'),
    ('Debit Card', 2, 'debitCard', 1, 'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/payment-icons/payment-cards.png'),
    ('Credit Card', 2, 'creditCard', 1, 'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/payment-icons/payment-cards.png'),
    ('Amex Card', 2, 'amexCard', 1, 'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/payment-icons/payment-cards.png'),
    ('Net Banking', 3, 'netBanking', 1, 'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/payment-icons/payment-net-bank.png'),
    ('Wallet', 4, 'wallet', 1, 'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/payment-icons/payment-wallet.png'),
    ('Card EMI', 2, 'cardEmi', 0, 'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/payment-icons/payment-cards.png')

-- payment_gateway
insert into payment_gateway
    (name)
values
    ('CCAVENUE'),
    ('AIRPAY')

-- PaymentOptionPaymentGatewayMapping
insert into payment_option_payment_gateway_mapping
    ("paymentOptionId", "paymentGatewayId", "order")
values
    -- cc avenue
    (1, 1, 2),
    (2, 1, 1),
    (3, 1, 1),
    (5, 1, 1),
    -- air pay
    (1, 2, 3),
    (2, 2, 2),
    (3, 2, 2),
    (5, 2, 3),
    (6, 2, 1),
    (7, 2, 1),
    -- hdfc
    (1, 3, 1),
    (2, 3, 3),
    (3, 3, 3),
    (5, 3, 2),
    (4, 3, 1)
,

-- payment_gateway_brand_mapping
INSERT INTO payment_gateway_brand_mapping
    ("merchantId", "forBrand", details, "paymentGatewayId", "status")
VALUES
    (
        423665,
        ARRAY
[1,4,5,8,10,11,12,13,14,15,18,19], 
'{
"merchant_id": 423665, 
"currency": "INR",
"redirect_url": "/payment/cc-avenue/response",
"cancel_url": "/payment/cc-avenue/response",
"language": "EN",
"upiPaymentFlag": "Intent,VPA",
"workingKey": "305A138B78CB06C81F65F5C82A11B00A",
"accessCode": "ATXU06MA13CK96UXKC"
}', 1, 'New');



INSERT INTO payment_gateway_brand_mapping
    ("merchantId", "forBrand", details, "paymentGatewayId", "status")
VALUES
    (
        423671,
        ARRAY
[2,3,7,17,20], 
'{
"merchant_id": 423671, 
"currency": "INR",
"redirect_url": "/payment/cc-avenue/response",
"cancel_url": "/payment/cc-avenue/response",
"language": "EN",
"upiPaymentFlag": "Intent,VPA",
"workingKey": "2348D3F4D21E0BDA554EAF80B97ADA2E",
"accessCode": "ATBV06MA14CK02VBKC"
}', 
1,
'New'
);

-- payment_gateway_brand_mapping
INSERT INTO payment_gateway_brand_mapping
    ("merchantId", "forBrand", details, "paymentGatewayId", "status")
VALUES
    (
        515473,
        ARRAY
[1,4,5,8,10,11,12,13,14,15,18,19], 
'{
"merchant_id": 515473, 
"currency": "INR",
"redirect_url": "/payment/cc-avenue/response",
"cancel_url": "/payment/cc-avenue/response",
"language": "EN",
"upiPaymentFlag": "Intent,VPA",
"workingKey": "14472464BdummyCD861E06808162D0",
"accessCode": "AVYC20Idummy41CYQA"
}', 1, 'Old');



INSERT INTO payment_gateway_brand_mapping
    ("merchantId", "forBrand", details, "paymentGatewayId", "status")
VALUES
    (
        515475,
        ARRAY
[2,3,7,17,20], 
'{
"merchant_id": 515475, 
"currency": "INR",
"redirect_url": "/payment/cc-avenue/response",
"cancel_url": "/payment/cc-avenue/response",
"language": "EN",
"upiPaymentFlag": "Intent,VPA",
"workingKey": "A6A68757E3dummyDD69BEF16658D",
"accessCode": "AVED20dummyQ46DEQA"
}', 
1,
'Old'
);

-- payment_gateway_brand_mapping
INSERT INTO payment_gateway_brand_mapping
    ("merchantId", "forBrand", details, "paymentGatewayId", "status", "universityTypeCode")
VALUES
    (
        4323422,
        ARRAY
[16], 
'{
"merchant_id": 4323422, 
"currency": "INR",
"redirect_url": "/payment/cc-avenue/response",
"cancel_url": "/payment/cc-avenue/response",
"language": "EN",
"upiPaymentFlag": "Intent,VPA",
"workingKey": "9DD997dummy8BC7F1889FD2374DD",
"accessCode": "AVWE74dummy97EWCC"
}', 1, 'Old', 'SGSU');



INSERT INTO payment_gateway_brand_mapping
    ("merchantId", "forBrand", details, "paymentGatewayId", "status", "universityTypeCode")
VALUES
    (
        4395812,
        ARRAY
[16], 
'{
"merchant_id": 4395812, 
"currency": "INR",
"redirect_url": "/payment/cc-avenue/response",
"cancel_url": "/payment/cc-avenue/response",
"language": "EN",
"upiPaymentFlag": "Intent,VPA",
"workingKey": "DB9DC00dummy75009FEE2D0BB3595F0",
"accessCode": "AVGD82dummyBW64DGWB"
}', 
1,
'Old',
'JGNU'
);

--air pay
INSERT INTO payment_gateway_brand_mapping
    ("merchantId", "forBrand", details, "paymentGatewayId")
VALUES
    (
        335854,
        ARRAY
[1,4,5,8,10,11,12,13,14,15,18,19,2,3,7,17,20],
'{
"mid": 335854,
"username": "CKFzeZGut2",
"password": "WRx4M373",
"secret": "V8GqK8T6RC4ajHM8",
"isocurrency": "INR",
"currency": 356
}', 2);