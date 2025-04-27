# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



proyecto/
│
├── src/
│   ├── components/
│   │   ├── common/               # Componentes compartidos en toda la aplicación
│   │   │   ├── Navbar.jsx        # Barra de navegación común
│   │   │   └── Footer.jsx        # Footer común, si es necesario
│   │   ├── admin/                # Componentes específicos de la sección de administración
│   │   │   ├── AdminLayout.jsx   # Layout común de las páginas de administración
│   │   │   ├── AdminDashboard.jsx # Dashboard de administración
│   │   │   ├── AdminLogin.jsx    # Formulario de inicio de sesión para administradores
│   │   │   ├── RegistroAutomotoras.jsx # Formulario de registro de automotoras
│   │   │   ├── EditarAutomotoras.jsx  # Formulario de edición de automotoras
│   │   │   ├── RegistroAutos.jsx      # Formulario de registro de autos
│   │   │   ├── EditarRecorridoAutos.jsx # Interfaz para editar el recorrido de los autos
│   │   │   ├── EliminarAutos.jsx      # Componente para eliminar autos
│   │   │   └── EliminarAutomotoras.jsx # Componente para eliminar automotoras
│   │   └── map/                  # Componentes relacionados con el mapa
│   │       └── Mapa.jsx          # Componente Mapa para ser utilizado en diferentes lugares
│   ├── pages/                    # Componentes de página que corresponden a rutas específicas
│   │   ├── HomePage.jsx          # Página de inicio para usuarios anónimos
│   │   └── NotFoundPage.jsx      # Página de error 404
│   └── ...
├── package.json                  # Dependencias del proyecto y scripts de npm
├── .env                          # Variables de entorno (si es necesario)
└── ...