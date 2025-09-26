import type React from "react";
import loginBanner from '@/assets/login-banner.jpg';
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { apiV1 } from "@/core/api";
import type { BaseResponse } from "@/core/types/base_response";
import type { User } from "@/core/types/user";
import { useStorage } from "@/core/provider/storage_provider";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export const Login = (): React.JSX.Element => {
  const storage = useStorage();
  const navigate = useNavigate();

  const handleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await apiV1<BaseResponse<User>>({
        method: 'POST',
        path: '/auth/google',
        body: { token: credentialResponse.credential }
      });

      storage?.save({ user: response?.data });
      toast.success(response?.message, { position: 'top-center' });
      navigate('/', { replace: true });
    } catch (error) {
      const exception = handleError(error);
      toast.error(exception.error, { position: 'top-center' });
    }
  }

  return (
    <div className="w-dvw h-dvh flex items-center justify-center pb-20 md:pb-0">
      <div className="flex flex-row gap-0 items-stretch justify-center w-full max-w-4xl p-4">
        <div className="hidden md:inline-flex flex-1 max-w-md">
          <img src={loginBanner} alt="login-banner" className="object-cover max-w-md h-[400px] rounded-l-md" />
        </div>
        <div className="border-0 md:border-1 dark:border-neutral-800 border-neutral-300 py-4 px-8 flex items-center justify-center flex-1 h-[400px] rounded-r-md">
          <div className="text-center max-w-[280px]">
            <div className="text-2xl font-bold mt-8">Voicify</div>
            <div className="text-sm mb-8">Generate text to speech in seconds</div>
            <div className="w-full">
              <GoogleLogin
                onSuccess={handleLogin}
                onError={() => {
                  console.log('Login Failed');
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-8">By clicking continue, you agree to our Terms of Service and Privacy Policy.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
