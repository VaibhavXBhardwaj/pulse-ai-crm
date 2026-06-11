import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-8">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#6366F1',
            colorBackground: '#ffffff',
            colorText: '#111827',
            borderRadius: '0.5rem',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          elements: {
            card: 'shadow-modal border border-gray-100',
            headerTitle: 'font-display font-bold text-gray-900',
            formButtonPrimary: 'bg-[#6366F1] hover:bg-[#4F46E5] transition-colors',
          },
        }}
      />
    </div>
  )
}