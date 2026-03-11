import { axiosRequest, MethodEnum } from 'src/common/helper/axiosRequest.helper';

export const checkCCAvenueIsActive = async () => {
  return await axiosRequest(
    MethodEnum.Post,
    `https://secure.ccavenue.com/transaction.do?command=orderStatusTracker`,
    {},
  );
};
