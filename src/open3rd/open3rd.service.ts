import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialPage } from '../entities/social-page.entity';
import { Tenant } from '../entities/tenant.entity';
import {TenantSettings} from '../entities/tenant-settings.entity';
import crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class Open3rdService {
    constructor(
        @InjectRepository(SocialPage)
        private socialPageRepository: Repository<SocialPage>,
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
        @InjectRepository(TenantSettings)
        private tenantSettingsRepository: Repository<TenantSettings>,
    ) {}


    async getSettings(tenantId: string) {
        const tenantSettings = await this.tenantSettingsRepository.findOne({
            where: { 
                tenant: { id: tenantId },
            },
        });
        return {
            statusCode: 200,
            brandSettings: tenantSettings?.brandSettings || {},
            systemSettings: tenantSettings?.systemSettings || {},
        };
    }


    async facebookRedirect() {
        const challengeCode = crypto.randomBytes(10).toString('hex');
        const appId = process.env.FACEBOOK_APP_ID;
        const redirectUri = process.env.APP_URL + '/open3rd/facebook/callback';
        const redirect_url = 'https://www.facebook.com/dialog/oauth?scope=email%2C%20pages_messaging%2C%20pages_manage_posts%2C%20pages_manage_metadata%2C%20pages_read_engagement%2C%20pages_read_user_content%2C%20pages_manage_engagement%2C%20%20public_profile%2Cbusiness_management&client_id=' + appId + '&redirect_uri=' + redirectUri + '&state=' + challengeCode  + '&response_type=code';
        
        return {
            redirect_url: redirect_url
        };
    }

    async facebookCallback(code: string) {
        let query= {
            grant_type: 'authorization_code',
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: process.env.APP_URL + '/open3rd/facebook/callback',
            code: code
        };
        let url = 'https://graph.facebook.com/oauth/access_token?' + Object.keys(query).map(key => `${key}=${query[key]}`).join('&');
        const response = await axios.get(url);
        console.log('[facebookCallback] response', response?.data);
        if(response) {
            const accessToken = response.data.access_token;
            const dataAccessToken = {
                grant_type: 'client_credentials',
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
            };
            const urlAccessToken = 'https://graph.facebook.com/oauth/access_token';
            const responseAccessToken = await axios.get(urlAccessToken, {
                params: dataAccessToken
            });
            console.log('[facebookCallback] responseAccessToken', responseAccessToken?.data);
            const clientAccessToken = responseAccessToken.data.access_token;
            const urlPage = 'https://graph.facebook.com/debug_token?access_token=' + clientAccessToken + '&input_token=' + accessToken;
            const responsePage = await axios.get(urlPage);
            console.log('[facebookCallback] responsePage', responsePage?.data);
            if(responsePage?.data?.data?.is_valid) {
                const pageId = responsePage?.data?.data?.user_id;
                const urlPageToken = 'https://graph.facebook.com/' + pageId + '/accounts?access_token=' + accessToken;
                const responsePageToken = await axios.get(urlPageToken);
                console.log(responsePageToken);
                if(responsePageToken?.data?.data?.length > 0) {
                    for(const page of responsePageToken?.data?.data) {
                        console.log('[facebookCallback] page', page);
                        const urlSubcribe = 'https://graph.facebook.com/' + page?.id + '/subscribed_apps';
                        const dataSubcribe = {
                            access_token: page?.access_token,
                            subscribed_fields: 'feed,messages,messaging_postbacks,messaging_optins,messaging_referrals,messaging_handovers,message_echoes'
                        };
                        const responseSubcribe = await axios.post(urlSubcribe, dataSubcribe);
                        const urlProfilePage = 'https://graph.facebook.com/me?access_token=' + page?.access_token;
                        const dataProfilePage = {
                            access_token: page?.access_token,
                            fields: 'picture'
                        };
                        const responseProfilePage = await axios.get(urlProfilePage, { params: dataProfilePage });
                        const profilePicture = responseProfilePage?.data?.picture?.data?.url ?? null;
                        const checkPage = await this.socialPageRepository.findOne({ where: { pageId: page?.id } });
                        if(checkPage) {
                            await this.socialPageRepository.update({ id: checkPage?.id }, {
                                accessToken: page?.access_token,
                                name: page?.name,
                                profilePicture: profilePicture
                            });
                        } else {
                            await this.socialPageRepository.create({
                                pageId: page?.id,
                                accessToken: page?.access_token,
                                name: page?.name,
                                profilePicture: profilePicture
                            });
                        }
                    }
                }
            }
        } else {

        }

        return {
            statusCode: 200,
            message: 'Success',
            urlRedirect: process.env.FE_APP_URL + '/settings',
        }
    }
}