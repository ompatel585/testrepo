import { Injectable } from '@nestjs/common';
import * as msal from '@azure/msal-node';
import axios from 'axios';

@Injectable()
export class M365AuthService {
  private msalClient;

  constructor() {
    this.msalClient = new msal.ConfidentialClientApplication({
      auth: {
        clientId: process.env.M365_CLIENT_ID,
        authority: `${process.env.M365_CLOUD_INSTANCE}/${process.env.M365_TENANT_ID}`,
        clientSecret: process.env.M365_CLIENT_SECRET,
      },
    });
  }

  getLoginUrl() {
    return this.msalClient.getAuthCodeUrl({
      scopes: ['User.Read'],
      redirectUri: process.env.M365_REDIRECT_URI,
      prompt: 'select_account',
    });
  }

  async getTokenFromCode(code: string) {
    const token = await this.msalClient.acquireTokenByCode({
      code,
      scopes: ['User.Read'],
      redirectUri: process.env.M365_REDIRECT_URI,
    });

    return token.accessToken;
  }

  async getUserProfile(accessToken: string) {
    const res = await axios.get(process.env.GRAPH_API_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data;
  }
}
