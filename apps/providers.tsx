'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import React, { Suspense } from 'react'
import { OAuthToast } from './user-app/components/oauth-toast'

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            {children}
            <Suspense fallback={null}>
                <OAuthToast />
            </Suspense>
            <Toaster position="top-center" richColors closeButton />
        </SessionProvider>
    )
}