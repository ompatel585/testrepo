import { axiosRequest, MethodEnum } from 'src/common/helper/axiosRequest.helper';

export const getDoSelectTestsEndpoint = async (url: string, page: number) => {
  console.log(`Requesting [GET] ${url}`);
  return await axiosRequest(
    MethodEnum.Get,
    `${url}`,
    {},
    {
      'Doselect-API-Key': `${process.env.DOSELECT_API_KEY}`,
      'Doselect-API-Secret': `${process.env.DOSELECT_API_SECRET}`,
    },
  );
};
