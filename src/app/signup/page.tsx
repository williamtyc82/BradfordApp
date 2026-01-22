import Link from 'next/link';
import { SignUpForm } from '@/components/auth/signup-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function SignUpPage() {
    const loginImage = PlaceHolderImages.find((img) => img.id === 'login-background');
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Create an Account</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <SignUpForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/" className="underline">
              Sign in
            </Link>
          </div>
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
