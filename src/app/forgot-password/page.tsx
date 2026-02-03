import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    const loginImage = PlaceHolderImages.find((img) => img.id === 'login-background');
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold font-headline">Reset Password</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email to receive a password reset link
                        </p>
                    </div>
                    <ForgotPasswordForm />
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
