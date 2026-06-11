import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[480px] bg-white border-r border-gray-100 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="font-display font-bold text-[15px] text-gray-900">PulseAI</span>
        </div>

        <div>
          <blockquote className="text-lg font-display font-medium text-gray-900 leading-relaxed mb-4">
            "We recovered 23% of churned customers in the first month. PulseAI understood our audience better than we did."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
              RM
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Rohit Mehta</div>
              <div className="text-xs text-gray-500">Head of Growth, Aara Fashion</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Support</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#6366F1',
              colorBackground: '#ffffff',
              colorText: '#111827',
              colorInputBackground: '#ffffff',
              colorInputText: '#111827',
              borderRadius: '0.5rem',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            elements: {
              card: 'shadow-modal border border-gray-100',
              headerTitle: 'font-display font-bold text-gray-900',
              headerSubtitle: 'text-gray-500',
              formButtonPrimary: 'bg-[#6366F1] hover:bg-[#4F46E5] transition-colors',
            },
          }}
        />
      </div>
    </div>
  )
}