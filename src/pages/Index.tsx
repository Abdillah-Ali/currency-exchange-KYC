import { Link } from 'react-router-dom';
import { ExchangeRatesBoard } from '@/components/ExchangeRatesBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Monitor, 
  ArrowRight, 
  Banknote,
  Shield,
  Clock,
  FileText,
  TrendingUp
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 75% 50%, hsl(var(--accent)) 0%, transparent 50%)'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-primary-foreground mb-6 shadow-lg">
              <Banknote className="h-10 w-10" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Bureau de Change
              <span className="block text-primary">Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Integrated queue management, KYC verification, AML compliance, and transaction processing — all in one seamless workflow.
            </p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link to="/queue">
              <Card className="group cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        Customer Queue
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Register for service, scan ID, and receive your queue ticket with live exchange rates.
                      </p>
                      <span className="inline-flex items-center text-primary font-medium">
                        Join Queue <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/teller">
              <Card className="group cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Monitor className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        Teller Dashboard
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Process transactions, manage queue, verify KYC, and handle cash operations.
                      </p>
                      <span className="inline-flex items-center text-primary font-medium">
                        Open Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">Integrated Workflow Features</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Queue System</h3>
              <p className="text-sm text-muted-foreground">
                Digital registration with ID scanning and automatic KYC lookup
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">KYC & AML</h3>
              <p className="text-sm text-muted-foreground">
                Automated verification and suspicious activity monitoring
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Live exchange rates and service availability status
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Receipt Printing</h3>
              <p className="text-sm text-muted-foreground">
                Queue tickets and transaction receipts for customers
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Exchange Rates Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Live Exchange Rates
              </h2>
              <p className="text-muted-foreground mt-1">Real-time rates with service availability</p>
            </div>
          </div>
          <ExchangeRatesBoard />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Banknote className="h-6 w-6" />
            <span className="font-semibold">Bureau de Change</span>
          </div>
          <p className="text-sm text-sidebar-foreground/70">
            Integrated Currency Exchange Management System
          </p>
          <p className="text-xs text-sidebar-foreground/50 mt-2">
            Compliant with Bank of Tanzania regulations
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
