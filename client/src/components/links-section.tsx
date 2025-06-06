import { Card, CardContent } from "./ui/card"
import { ExternalLink, Github, BookOpen } from "lucide-react"

export function LinksSection() {
  const links = [
    {
      icon: ExternalLink,
      title: "Starkscan Contract",
      description: "View deployed contract on Sepolia",
      href: "https://sepolia.starkscan.co/contract/0x31b119987eeb1a6c0d13b029ad9a3c64856369dcdfd6e69d9af4c9fba6f507f#overview",
      target: "_blank",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Complete setup and development guide",
      href: "https://dojo-by-example.vercel.app/",
      target: "_blank",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Github,
      title: "GitHub Repository",
      description: "Fork and customize this template",
      href: "https://github.com/AkatsukiLabs/Dojo-Game-Starter",
      target: "_blank",
      color: "from-gray-500 to-gray-600",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <a
              key={link.title}
              href={link.href}
              target={link.target}
              rel="noopener noreferrer"
              className="w-full"
            >
              <Card className="w-full bg-white/5 backdrop-blur-xl border-white/10 
                                hover:border-white/20 transition-all duration-300 
                                hover:scale-105 cursor-pointer">
                <CardContent className="p-6 h-full flex flex-col justify-start">
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${link.color} 
                                  flex items-center justify-center transition-transform duration-300 
                                  hover:scale-110`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-lg">
                    {link.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-snug">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>
    </div>
  )
}
