import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/services/auth.service';

interface LoginPageInlineProps {
  onLogin: (email: string) => void;
  onClose?: () => void;
}

export function LoginPageInline({ onLogin, onClose }: LoginPageInlineProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email: loginEmail,
        password: loginPassword
      });

      if (response.success && response.user) {
        onLogin(response.user.email);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        phone: registerData.phone
      });

      if (response.success && response.user) {
        onLogin(response.user.email);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <motion.section 
      className="py-16 px-4 bg-background"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-border bg-card shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-serif text-2xl">Welcome to Vauria</CardTitle>
              <CardDescription className="font-sans">
                Sign in to your royal account or create a new one
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="font-sans">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="font-sans">Create Account</TabsTrigger>
                </TabsList>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                  >
                    <p className="text-destructive text-sm font-sans">{error}</p>
                  </motion.div>
                )}

                <TabsContent value="login">
                  <motion.form 
                    onSubmit={handleLogin}
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="font-sans font-medium">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="queen@vauria.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="h-12 bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="font-sans font-medium">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="h-12 bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="text-right">
                      <button 
                        type="button" 
                        className="text-primary hover:text-primary/80 font-sans text-sm transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </motion.div>
                  </motion.form>
                </TabsContent>

                <TabsContent value="register">
                  <motion.form 
                    onSubmit={handleRegister}
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="font-sans font-medium">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="Isabella"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                          className="h-12 bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="font-sans font-medium">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Martinez"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                          className="h-12 bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="font-sans font-medium">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="queen@vauria.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="h-12 bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-sans font-medium">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-12 bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="font-sans font-medium">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="h-12 bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="font-sans font-medium">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="h-12 bg-input-background border-border font-sans focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </motion.div>
                  </motion.form>
                </TabsContent>
              </Tabs>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-sans">Or continue with</span>
                </div>
              </div>

              {/* Privacy Notice */}
              <p className="text-xs text-muted-foreground text-center mt-6 font-sans">
                By signing up, you agree to our Terms of Service and Privacy Policy. 
                Your jewelry journey starts here.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
}