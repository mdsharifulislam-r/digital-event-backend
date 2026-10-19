export type ISocialSignIn = {
    email: string;
    name: string;
    picture: string;
    appId: string;
    social_type: "Google" | "Facebook"|'Apple';
};