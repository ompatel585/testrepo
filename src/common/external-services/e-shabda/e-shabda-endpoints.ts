import axios from 'axios';
import FormData from 'form-data';
const qs = require('qs');

export const addOrReplaceBook = async (form: FormData) => {
  return await axios.post('http://www.e-shabda.com/securePub/manageBook', form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
};

export const generateDownloadLink = async (data) => {
  return await axios.post(
    'http://www.e-shabda.com/securePub/generateDownloadLink',
    qs.stringify(data),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
};
