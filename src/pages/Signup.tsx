
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Phone, AlertCircle, Loader2, GraduationCap, BookOpen, Users, Star } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { sanitizeInput, validateEmail, validatePhone, validatePassword, rateLimit } from '@/utils/security';

const cleanupAuthState = () => {
  localStorage.removeItem('supabase.auth.token');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) localStorage.removeItem(key);
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) sessionStorage.removeItem(key);
  });
};

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const rawRedirect = queryParams.get('redirect') || '/';
  const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/';
  
  useEffect(() => {
    const checkOAuthSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        toast({ title: "Signup Successful", description: "Your account has been created!" });
        navigate(redirectTo);
      }
    };
    checkOAuthSession();
  }, [navigate, redirectTo, toast]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clientId = email || 'anonymous';
    if (!rateLimit.canAttempt(`signup_${clientId}`, 3, 15 * 60 * 1000)) {
      setError('Too many signup attempts. Please try again later.');
      return;
    }

    const sanitizedFullName = sanitizeInput(fullName);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);

    if (!validateEmail(sanitizedEmail)) { setError('Please enter a valid email address.'); return; }
    if (!validatePhone(sanitizedPhone)) { setError('Please enter a valid phone number.'); return; }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) { setError(passwordValidation.errors[0]); return; }
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    if (!agreeToTerms) { setError("You must agree to the Terms of Service and Privacy Policy"); return; }

    setLoading(true);
    try {
      cleanupAuthState();
      try { await supabase.auth.signOut({ scope: 'global' }); } catch {}

      const correctDomain = 'https://www.eduwarnnepal.com';
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: { full_name: sanitizedFullName, phone: sanitizedPhone },
          emailRedirectTo: `${correctDomain}/login`,
        },
      });

      if (error) {
        setError(error.message);
        toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Signup Successful", description: "Please check your email to confirm your account." });
        navigate('/login');
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      toast({ title: "Signup Failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      cleanupAuthState();
      const correctDomain = 'https://www.eduwarnnepal.com';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${correctDomain}/signup?redirect=${encodeURIComponent(redirectTo)}` }
      });
      if (error) toast({ title: "Google Signup Failed", description: error.message, variant: "destructive" });
    } catch {
      toast({ title: "Google Signup Failed", description: "An unexpected error occurred.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/95 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <img src="/team-members/eduwarn_nepal-logo.jpeg" alt="EduWarn Nepal Logo" className="h-16 w-16 rounded-xl shadow-lg mb-6" />
            <h1 className="text-4xl font-bold mb-3">EduWarn Nepal</h1>
            <p className="text-xl text-white/80">Start Your Learning Journey</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/15 p-3 rounded-xl"><GraduationCap className="h-6 w-6" /></div>
              <div><h3 className="font-semibold">Expert Teachers</h3><p className="text-sm text-white/70">Learn from the best educators in Nepal</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/15 p-3 rounded-xl"><BookOpen className="h-6 w-6" /></div>
              <div><h3 className="font-semibold">Comprehensive Study Materials</h3><p className="text-sm text-white/70">Notes, question banks & practice tests</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/15 p-3 rounded-xl"><Users className="h-6 w-6" /></div>
              <div><h3 className="font-semibold">Small Batch Sizes</h3><p className="text-sm text-white/70">Personalized attention for every student</p></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-sm italic text-white/90">"The physics course made a huge difference in my understanding. Their methodology is excellent!"</p>
            <p className="text-xs text-white/60 mt-2">— Srishti Poudel, Grade 11 Student</p>
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/team-members/eduwarn_nepal-logo.jpeg" alt="EduWarn Nepal" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold text-primary">EduWarn Nepal</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
            <p className="text-muted-foreground mt-2">Join EduWarn Nepal to start your learning journey</p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={18} /><span>{error}</span>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User size={18} className="text-muted-foreground" /></div>
                <Input id="name" type="text" placeholder="Your full name" className="pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={18} className="text-muted-foreground" /></div>
                <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={18} className="text-muted-foreground" /></div>
                <Input id="phone" type="tel" placeholder="+977 98XXXXXXXX" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-muted-foreground" /></div>
                  <Input id="password" type="password" placeholder="Min. 8 chars" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-1.5">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={18} className="text-muted-foreground" /></div>
                  <Input id="confirm-password" type="password" placeholder="Confirm" className="pl-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-2 pt-1">
              <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => setAgreeToTerms(checked === true)} />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</> : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-3 bg-background text-muted-foreground">Or continue with</span></div>
            </div>
            <Button onClick={handleGoogleSignup} variant="outline" className="w-full mt-4 h-11" type="button">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>
          </div>
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
