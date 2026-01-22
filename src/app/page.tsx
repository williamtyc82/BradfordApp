import { LoginForm } from '@/components/auth/login-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-background');
  const logo = PlaceHolderImages.find((img) => img.id === 'logo');
  
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            {logo && (
              <div className="flex justify-center">
                <Image
                  src={logo.imageUrl}
                  alt={logo.description}
                  width={240}
                  height={60}
                  className="object-contain"
                  data-ai-hint={logo.imageHint}
                />
              </div>
            )}
          </div>
          <LoginForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            fill
            className="object-cover"
            data-ai-hint={loginImage.imageHint}
          />
        )}
      </div>
    </div>
  );
}
