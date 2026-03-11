import axios from 'axios';

export enum MethodEnum {
  Get = 'get',
  Post = 'post',
}

export const axiosRequest = async (
  method,
  url,
  data = {},
  headers = {},
  options = {},
) => {
  try {
    // Set default headers if not provided
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Set up Axios request configuration
    let config: any = {
      method,
      url,
      headers: defaultHeaders,
      ...options,
    };

    // Include data in the request if it's not a GET request
    if (method.toLowerCase() !== 'get') {
      config.data = data;
    }

    // Make the request using Axios
    const response = await axios(config);

    // Return the response data
    return response.data;
  } catch (error) {
    // Handle and return the error
    // console.error('Error making request:', error);
    throw error;
  }
};
