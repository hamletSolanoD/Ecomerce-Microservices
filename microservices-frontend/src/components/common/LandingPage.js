import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CloudIcon, 
  ServerIcon, 
  ShieldCheckIcon, 
  CubeTransparentIcon,
  DocumentTextIcon,
  DatabaseIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/outline';

const LandingPage = () => {
  const features = [
    {
      icon: CloudIcon,
      title: "Hosting Premium",
      description: "Infraestructura robusta y escalable para tu negocio con garantía de uptime del 99.9%"
    },
    {
      icon: ShieldCheckIcon,
      title: "Seguridad Avanzada",
      description: "Protección SSL, firewall y copias de seguridad automáticas diarias"
    },
    {
      icon: DatabaseIcon,
      title: "Base de Datos",
      description: "Gestión completa de bases de datos MySQL y PostgreSQL optimizadas"
    },
    {
      icon: ServerIcon,
      title: "Servidores Dedicados",
      description: "Recursos dedicados exclusivamente para tu proyecto"
    },
    {
      icon: DocumentTextIcon,
      title: "Panel de Control",
      description: "Interfaz intuitiva para gestionar todos tus servicios desde un solo lugar"
    },
    {
      icon: CubeTransparentIcon,
      title: "APIs Integradas",
      description: "Conecta y automatiza tus procesos con nuestras APIs"
    }
  ];

  const plans = [
    {
      name: "Mensual",
      description: "Perfecto para proyectos en desarrollo",
      features: [
        "Soporte 24/7",
        "SSL gratuito",
        "Copias de seguridad diarias",
        "Panel de control avanzado"
      ]
    },
    {
      name: "Trimestral",
      description: "Ideal para empresas en crecimiento",
      popular: true,
      features: [
        "Todas las características del plan mensual",
        "Descuento del 15%",
        "Optimización automática",
        "Soporte prioritario"
      ]
    },
    {
      name: "Anual",
      description: "Máximo ahorro para empresas establecidas",
      features: [
        "Todas las características del plan trimestral",
        "Descuento del 30%",
        "Consultoría técnica gratuita",
        "Migración sin costo"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Carlos Martín",
      company: "TechStartup MX",
      content: "Excelente servicio y soporte técnico. Nuestro sitio web ha estado funcionando perfectamente desde que migramos.",
      rating: 5
    },
    {
      name: "Ana López",
      company: "E-commerce Plus",
      content: "La facilidad de manejo del panel de control y la velocidad de respuesta superaron nuestras expectativas.",
      rating: 5
    },
    {
      name: "Roberto García",
      company: "Agencia Digital Pro",
      content: "Llevamos 2 años con sus servicios y no hemos tenido ni una sola caída. Altamente recomendable.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="relative flex items-center justify-between py-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">ServiceHub</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Características</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Precios</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonios</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Registrarse
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900">
              Potencia tu negocio con
              <span className="text-indigo-600"> servicios premium</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              Hosting, bases de datos, servidores dedicados y mucho más. Todo lo que necesitas para hacer crecer tu empresa en un solo lugar.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Comenzar Gratis
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Saber Más
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              ¿Por qué elegir ServiceHub?
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Ofrecemos la mejor tecnología y soporte para tu negocio
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center">
                  <feature.icon className="h-12 w-12 text-indigo-600" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Planes flexibles para cada necesidad
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Elige la modalidad que mejor se adapte a tu proyecto
            </p>
          </div>
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg shadow-lg p-8 ${
                  plan.popular 
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' 
                    : 'bg-white'
                }`}
              >
                {plan.popular && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-4">
                    Más Popular
                  </span>
                )}
                <h3 className={`text-2xl font-semibold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  Plan {plan.name}
                </h3>
                <p className={`mt-2 ${plan.popular ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className={`h-5 w-5 ${plan.popular ? 'text-white' : 'text-green-500'} mr-3`} />
                      <span className={plan.popular ? 'text-white' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    to="/services"
                    className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md ${
                      plan.popular
                        ? 'bg-white text-indigo-600 hover:bg-gray-50'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    Ver Servicios
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            ¿Listo para empezar?
          </h2>
          <p className="mt-4 text-xl text-indigo-100">
            Únete a miles de empresas que ya confían en nosotros
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
            >
              Comenzar Ahora
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-indigo-400">ServiceHub</span>
              <p className="mt-2 text-gray-400">
                Tu plataforma de servicios premium de confianza
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Hosting</li>
                <li>Servidores</li>
                <li>Bases de Datos</li>
                <li>APIs</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentación</li>
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>Estado del Sistema</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Cuenta</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-gray-400 hover:text-white">
                    Registrarse
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-gray-400 hover:text-white">
                    Ver Servicios
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ServiceHub. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;