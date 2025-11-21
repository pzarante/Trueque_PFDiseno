import { motion } from "motion/react";
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Search,
  MessageSquare,
  CheckCircle,
  Zap,
  Heart,
  Star,
  Package,
  Award,
  ArrowRightLeft,
  Rocket,
  Target
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { useThemeColor, getGradientClasses, getShadowClasses, getAccentBgClasses, getAccentBorderClasses, getAccentTextClasses, getHeroBackgroundClasses, getHeroOrbColors, getParticleColor } from "../hooks/useThemeColor";
import { ThemeColor } from "./ThemeColorPicker";

interface HeroProps {
  onNavigate: (page: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const shadowClasses = getShadowClasses(themeColor);
  const accentBgClasses = getAccentBgClasses(themeColor);
  const accentBorderClasses = getAccentBorderClasses(themeColor);
  const accentTextClasses = getAccentTextClasses(themeColor);
  const heroBackgroundClasses = getHeroBackgroundClasses(themeColor);
  const heroOrbColors = getHeroOrbColors(themeColor);

  return (
    <div className="min-h-screen pt-16 overflow-hidden">
      {/* Hero Section con Parallax */}
      <section className="relative min-h-screen flex items-center">
        {/* Animated Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${heroBackgroundClasses}`} />
        
        {/* Animated Gradient Orbs - Más visibles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-20 -right-40 w-[500px] h-[500px] bg-gradient-to-br ${heroOrbColors.orb1} rounded-full blur-3xl opacity-50`}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br ${heroOrbColors.orb2} rounded-full blur-3xl opacity-40`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br ${heroOrbColors.orb3} rounded-full blur-3xl opacity-40`}
        />

        {/* Floating Particles */}
        <FloatingParticles themeColor={themeColor} />

        {/* Content */}
        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex items-center gap-2 ${accentBgClasses} border ${accentBorderClasses} rounded-full px-4 py-2 mb-6 backdrop-blur-sm`}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className={`w-4 h-4 ${accentTextClasses}`} />
                  </motion.div>
                  <span className={`text-sm ${accentTextClasses}`}>
                    Plataforma #1 de Trueques en Colombia
                  </span>
                </motion.div>

                {/* Título más pequeño en 2 líneas horizontales */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6 text-black dark:text-white"
                >
                  <span className="font-bold">
                    Descubre lo que buscas,{" "}
                  </span>
                  <span className="font-bold">
                    ofrece lo que tienes
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-muted-foreground mb-8 leading-relaxed"
                >
                  Únete a más de <span className={`${accentTextClasses} font-medium`}>50,000 usuarios</span> que ya están intercambiando objetos de forma segura y sostenible. Dale una segunda vida a tus objetos mientras ayudas al planeta.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 mb-8"
                >
                  <Button
                    onClick={() => onNavigate("register")}
                    size="lg"
                    className={`bg-gradient-to-r ${gradientClasses} text-white px-8 group shadow-xl ${shadowClasses} hover:shadow-2xl transition-all min-h-[48px]`}
                    aria-label="Comenzar a usar Swaply gratis"
                  >
                    <Rocket className="w-4 h-4 mr-2 group-hover:translate-y-[-2px] transition-transform" />
                    Comenzar Gratis
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    onClick={() => onNavigate("marketplace")}
                    size="lg"
                    variant="outline"
                    className={`px-8 border-2 ${accentBorderClasses} ${accentTextClasses} ${accentBgClasses} backdrop-blur-sm min-h-[48px]`}
                    aria-label="Ver productos disponibles en el marketplace"
                  >
                    Explorar Marketplace
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center gap-6 text-sm text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span>Sin comisiones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span>100% verificado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span>Gratis siempre</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Content - Icono de la Aplicación */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.3 }}
                className="flex justify-center items-center"
              >
                <div className="relative">
                  {/* Círculos de fondo animados */}
                  <motion.div
                    animate={{
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className={`absolute inset-0 bg-gradient-to-br ${gradientClasses} opacity-20 rounded-full blur-2xl scale-150`}
                  />
                  
                  {/* Logo Container */}
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className={`w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br ${gradientClasses} rounded-3xl shadow-2xl ${shadowClasses} flex items-center justify-center backdrop-blur-xl border border-white/20 relative overflow-hidden`}>
                      {/* Efecto de brillo */}
                      <motion.div
                        animate={{
                          x: [-300, 300],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                      
                      {/* Logo */}
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        }}
                      >
                        <ArrowRightLeft className="w-32 h-32 sm:w-40 sm:h-40 text-white drop-shadow-2xl" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Partículas alrededor del logo */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-3 h-3 bg-gradient-to-br ${gradientClasses} rounded-full`}
                      style={{
                        top: "50%",
                        left: "50%",
                      }}
                      animate={{
                        x: [0, Math.cos((i / 8) * Math.PI * 2) * 150],
                        y: [0, Math.sin((i / 8) * Math.PI * 2) * 150],
                        opacity: [1, 0],
                        scale: [1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Bar */}
      <AnimatedStatsBar />

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-[#0a1628] dark:to-[#0d1f38] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className={`mb-4 bg-gradient-to-r ${gradientClasses} text-white border-0 shadow-lg`}>
              Proceso Simple
            </Badge>
            <h2 className="text-4xl sm:text-5xl mb-4 text-black dark:text-white font-bold">
              Cómo funciona Swaply
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              En solo 3 pasos puedes comenzar a intercambiar objetos con miles de personas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <ProcessStep
              step="1"
              icon={<Search className="w-6 h-6" />}
              title="Publica o Busca"
              description="Sube fotos de lo que quieres intercambiar o explora el marketplace para encontrar lo que necesitas."
              delay={0}
            />
            <ProcessStep
              step="2"
              icon={<MessageSquare className="w-6 h-6" />}
              title="Conecta y Negocia"
              description="Contacta con otros usuarios, propón intercambios y acuerda los detalles de forma segura."
              delay={0.1}
            />
            <ProcessStep
              step="3"
              icon={<CheckCircle className="w-6 h-6" />}
              title="Intercambia y Valora"
              description="Realiza el intercambio y deja tu valoración. Construye tu reputación en la comunidad."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-4 text-black dark:text-white">
              ¿Por qué elegir Swaply?
            </h2>
            <p className="text-lg text-black dark:text-white max-w-2xl mx-auto">
              La plataforma de trueques más completa y segura de Colombia
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6" />}
              title="100% Seguro"
              description="Sistema de verificación de usuarios y valoraciones para intercambios confiables."
              delay={0}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Rápido y Eficiente"
              description="Publica productos en minutos con nuestro sistema inteligente de matching."
              delay={0.1}
            />
            <FeatureCard
              icon={<Heart className="w-6 h-6" />}
              title="Sostenible"
              description="Reduce tu huella de carbono dando una segunda vida a objetos."
              delay={0.2}
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Comunidad Activa"
              description="Más de 50,000 usuarios intercambiando cada día en toda España."
              delay={0}
            />
            <FeatureCard
              icon={<Award className="w-6 h-6" />}
              title="Sin Comisiones"
              description="Totalmente gratis, siempre. No cobramos comisiones por intercambios."
              delay={0.1}
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Matching Inteligente"
              description="Encuentra las mejores coincidencias automáticamente con IA."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-[#0d1f38] dark:to-[#0a1628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className={`mb-4 bg-gradient-to-r ${gradientClasses} text-white border-0`}>
              Testimonios
            </Badge>
            <h2 className="text-4xl sm:text-5xl mb-4 text-black dark:text-white">
              Lo que dicen nuestros usuarios
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="María González"
              role="Usuaria verificada"
              content="Increíble plataforma. He intercambiado más de 15 objetos y todos los intercambios han sido perfectos."
              rating={5}
              delay={0}
            />
            <TestimonialCard
              name="Carlos Rodríguez"
              role="Usuario desde 2023"
              content="Llevo 6 meses usando Swaply y estoy encantado. He conseguido cosas increíbles sin gastar dinero."
              rating={5}
              delay={0.1}
            />
            <TestimonialCard
              name="Laura Martín"
              role="23 intercambios"
              content="Una forma sostenible y económica de conseguir lo que necesitas. La app es muy fácil de usar."
              rating={5}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientClasses}`} />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400 rounded-full blur-3xl opacity-30"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <ArrowRightLeft className="w-16 h-16 text-white/80" />
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl text-white mb-6">
            ¿Listo para comenzar a intercambiar?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a Swaply hoy mismo y descubre un mundo de posibilidades. Registrarte es gratis y solo toma 2 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate("register")}
              size="lg"
              className="bg-white text-blue-600 hover:bg-white/90 px-8 shadow-xl hover:shadow-2xl transition-all min-h-[48px]"
            >
              Crear Cuenta Gratis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => onNavigate("marketplace")}
              size="lg"
              className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-blue-600 px-8 backdrop-blur-xl transition-all min-h-[48px]"
            >
              Ver Marketplace
            </Button>
          </div>
          <p className="text-sm text-white/80 mt-6">
            Los primeros 1000 usuarios obtienen insignia de Early Adopter
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className={`bg-gradient-to-br ${gradientClasses} p-2 rounded-xl`}>
                  <ArrowRightLeft className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-medium">Swaply</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma líder de trueques en Colombia. Intercambia de forma segura y sostenible.
              </p>
            </div>
            <div>
              <h4 className="mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Cómo Funciona</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Seguridad</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Comunidad</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Guía de Usuario</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Consejos</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © 2024 Swaply. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Floating Particles Component
function FloatingParticles({ themeColor }: { themeColor: ThemeColor }) {
  const particles = Array.from({ length: 30 });
  const particleColor = getParticleColor(themeColor);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 ${particleColor} rounded-full`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedStatsBar() {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const accentBorderClasses = getAccentBorderClasses(themeColor);
  
  return (
    <section className={`py-8 bg-gradient-to-r ${gradientClasses} border-y ${accentBorderClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem value="50,000+" label="Usuarios" icon={<Users className="w-5 h-5" />} delay={0} />
          <StatItem value="180,000+" label="Productos" icon={<Package className="w-5 h-5" />} delay={0.1} />
          <StatItem value="95,000+" label="Intercambios" icon={<Award className="w-5 h-5" />} delay={0.2} />
          <StatItem value="4.9★" label="Valoración" icon={<Star className="w-5 h-5" />} delay={0.3} />
        </div>
      </div>
    </section>
  );
}

function StatItem({
  value,
  label,
  icon,
  delay,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center text-white"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg mb-2"
      >
        {icon}
      </motion.div>
      <p className="text-2xl sm:text-3xl mb-1 font-bold">{value}</p>
      <p className="text-sm text-white/90">{label}</p>
    </motion.div>
  );
}

function ProcessStep({
  step,
  icon,
  title,
  description,
  delay,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const accentBgClasses = getAccentBgClasses(themeColor);
  const accentBorderClasses = getAccentBorderClasses(themeColor);
  const accentTextClasses = getAccentTextClasses(themeColor);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="relative"
    >
      <Card className={`p-8 hover:shadow-2xl transition-all h-full border-2 ${accentBorderClasses} bg-white/50 dark:bg-card/50 backdrop-blur-sm`}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay }}
          className={`absolute -top-6 -left-6 w-14 h-14 bg-gradient-to-br ${gradientClasses} rounded-2xl flex items-center justify-center text-white shadow-xl`}
        >
          <span className="text-xl">{step}</span>
        </motion.div>
        <div className={`w-14 h-14 ${accentBgClasses} rounded-xl flex items-center justify-center ${accentTextClasses} mb-4 ml-8`}>
          {icon}
        </div>
        <h3 className={`mb-3 ${accentTextClasses}`}>{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const accentBorderClasses = getAccentBorderClasses(themeColor);
  const accentTextClasses = getAccentTextClasses(themeColor);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-6 rounded-2xl border-2 ${accentBorderClasses} bg-gradient-to-br from-white to-muted dark:from-card dark:to-background hover:shadow-xl transition-all`}
    >
      <motion.div
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
        className={`w-12 h-12 bg-gradient-to-br ${gradientClasses} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}
      >
        {icon}
      </motion.div>
      <h3 className={`mb-3 ${accentTextClasses}`}>{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function TestimonialCard({
  name,
  role,
  content,
  rating,
  delay,
}: {
  name: string;
  role: string;
  content: string;
  rating: number;
  delay: number;
}) {
  const { themeColor } = useThemeColor();
  const gradientClasses = getGradientClasses(themeColor);
  const accentBorderClasses = getAccentBorderClasses(themeColor);
  const accentTextClasses = getAccentTextClasses(themeColor);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className={`bg-white dark:bg-card rounded-2xl p-6 border-2 ${accentBorderClasses} hover:shadow-xl transition-all`}
    >
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + i * 0.1 }}
          >
            <Star className={`w-4 h-4 fill-primary text-primary`} />
          </motion.div>
        ))}
      </div>
      <p className="text-muted-foreground mb-6 leading-relaxed">"{content}"</p>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradientClasses} rounded-full flex items-center justify-center text-white`}>
          {name.charAt(0)}
        </div>
        <div>
          <p className={`font-medium ${accentTextClasses}`}>{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
