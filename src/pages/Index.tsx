import BlockchainHero from '../components/BlockchainHero';
import About from '../components/sections/About';
import Contact from '../components/sections/Contact';
import CTA from '../components/sections/CTA';
import Footer from '../components/sections/Footer';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      <BlockchainHero />
      <About />
      <Contact />
      <CTA />
      <div id="pricing" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-400 to-purple-400">Transparent</span> Pricing
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Choose the perfect plan for your document verification needs. All plans include blockchain security and AI-powered analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="glass-morphism p-8 rounded-lg flex flex-col items-center animate-float">
              <Shield className="h-10 w-10 mb-4 text-primary animate-pulse-glow" />
              <h3 className="text-xl font-semibold mb-2">Basic</h3>
              <div className="text-3xl font-bold mb-1">Free <span className="text-base font-normal">/forever</span></div>
              <p className="text-muted-foreground mb-6 text-center">Perfect for individual students and personal use</p>
              <ul className="mb-8 space-y-2 text-sm text-muted-foreground text-left">
                <li>✓ 5 document verifications per month</li>
                <li>✓ Basic AI analysis</li>
                <li>✓ Standard blockchain storage</li>
                <li>✓ Email support</li>
                <li>✓ Certificate generation</li>
                <li>✓ Mobile QR verification</li>
              </ul>
              <Button className="w-full" onClick={() => window.location.href='/upload'}>Get Started</Button>
            </div>
            {/* Pro Plan */}
            <div className="glass-morphism p-8 rounded-lg flex flex-col items-center border-2 border-primary shadow-lg animate-float">
              <Shield className="h-10 w-10 mb-4 text-primary animate-pulse-glow" />
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-1">$19 <span className="text-base font-normal">/per month</span></div>
              <p className="text-muted-foreground mb-6 text-center">Ideal for professionals and small institutions</p>
              <ul className="mb-8 space-y-2 text-sm text-muted-foreground text-left">
                <li>✓ 100 document verifications per month</li>
                <li>✓ Advanced AI analysis with fraud detection</li>
                <li>✓ Priority blockchain processing</li>
                <li>✓ 24/7 chat support</li>
                <li>✓ Bulk upload and processing</li>
                <li>✓ API access</li>
                <li>✓ Custom branding</li>
                <li>✓ Detailed analytics dashboard</li>
              </ul>
              <Button className="w-full" variant="secondary" onClick={() => alert('Start Pro Trial coming soon!')}>Start Pro Trial</Button>
            </div>
            {/* Enterprise Plan */}
            <div className="glass-morphism p-8 rounded-lg flex flex-col items-center animate-float">
              <Shield className="h-10 w-10 mb-4 text-primary animate-pulse-glow" />
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-1">$199 <span className="text-base font-normal">/per month</span></div>
              <p className="text-muted-foreground mb-6 text-center">For universities and large organizations</p>
              <ul className="mb-8 space-y-2 text-sm text-muted-foreground text-left">
                <li>✓ Unlimited document verifications</li>
                <li>✓ AI model customization</li>
                <li>✓ Dedicated blockchain network</li>
                <li>✓ Priority phone & email support</li>
                <li>✓ White-label solution</li>
                <li>✓ Advanced API with webhooks</li>
                <li>✓ Custom integrations</li>
                <li>✓ Compliance reporting</li>
                <li>✓ SSO integration</li>
                <li>✓ Dedicated account manager</li>
              </ul>
              <Button className="w-full" variant="outline" onClick={() => alert('Contact Sales coming soon!')}>Contact Sales</Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
