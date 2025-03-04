import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CloudLightning, Shield, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudLightning className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">KloudWatcher</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Disaster Response and Relief Coordination Platform
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A cloud-based platform leveraging AI and GIS technologies to enhance disaster management, response
                    coordination, and resource allocation.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-1">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl p-8 text-white aspect-video flex flex-col justify-center items-center text-center">
                  <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">Disaster Response in Asia Pacific</h3>
                    <p className="text-sm md:text-base opacity-90">
                      Asia-Pacific is the world's most disaster-prone region. Our platform helps coordinate effective disaster response and management across the region.
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-bold text-xl">24/7</div>
                        <div>Monitoring</div>
                      </div>
                      <div>
                        <div className="font-bold text-xl">Real-time</div>
                        <div>Response</div>
                      </div>
                      <div>
                        <div className="font-bold text-xl">AI-powered</div>
                        <div>Analysis</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers comprehensive tools for effective disaster management
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Real-Time Monitoring</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Aggregate data from multiple sources including IoT devices, social media, and satellite imagery for
                  accurate situational awareness.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Resource Management</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Efficiently allocate and track resources during disaster response, ensuring optimal distribution to
                  affected areas.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.93 4.93 4.24 4.24" />
                    <path d="m14.83 9.17 4.24-4.24" />
                    <path d="m14.83 14.83 4.24 4.24" />
                    <path d="m9.17 14.83-4.24 4.24" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI-Powered Analytics</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Leverage AI for damage assessment, resource optimization, and impact prediction to enhance response
                  effectiveness.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">GIS Mapping</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Visualize disaster-affected areas with advanced GIS mapping tools for better spatial understanding and
                  planning.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Stakeholder Collaboration</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Enable seamless communication and coordination among governments, NGOs, volunteers, and affected
                  communities.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Scalable Infrastructure</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Built on serverless architecture to handle peak demands efficiently during disaster events.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About KloudWatcher</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    KloudWatcher was developed to address the critical gaps in existing disaster response systems,
                    providing a unified platform that integrates cutting-edge technologies with a focus on
                    sustainability and inclusivity.
                  </p>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                    Our platform aligns with the United Nations' Sustainable Development Goals, particularly Goal 11:
                    Sustainable Cities and Communities, by building resilient infrastructure and reducing the adverse
                    impacts of natural disasters.
                  </p>
                </div>
              </div>
              <div className="mx-auto lg:ml-0">
                <div className="bg-white rounded-xl p-8 shadow-lg">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 text-center mb-6">
                      <div className="text-2xl font-bold text-blue-600 mb-2">Cloud Infrastructure</div>
                      <div className="h-1 w-20 bg-blue-500 mx-auto"></div>
                    </div>
                    {[
                      { title: 'Real-time Data', icon: '📊' },
                      { title: 'Scalable Systems', icon: '🔄' },
                      { title: 'Secure Storage', icon: '🔒' },
                      { title: 'AI Analytics', icon: '🤖' },
                      { title: 'Global Access', icon: '🌐' },
                      { title: 'Fast Response', icon: '⚡' },
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <div className="text-sm font-medium text-gray-800">{item.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contact Us</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Have questions about KloudWatcher? Get in touch with our team.
                </p>
              </div>
              <div className="w-full max-w-md space-y-4">
                <form className="grid gap-4">
                  <div className="grid gap-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-left"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your message"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <CloudLightning className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">© 2025 KloudWatcher. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

