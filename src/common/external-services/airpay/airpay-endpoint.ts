import { axiosRequest, MethodEnum } from 'src/common/helper/axiosRequest.helper';

export const checkAirPayIsActive = async () => {
  return await axiosRequest(
    MethodEnum.Get,
    `https://payments.airpay.co.in/pay/index.php`,
  );
};
