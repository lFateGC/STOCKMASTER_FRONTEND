# StockMaster — Frontend

Cliente web de la plataforma StockMaster para la administración de inventarios, compras, ventas (POS), kardex y usuarios.

## Arquitectura del Proyecto

```
stockmaster-frontend/
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   └── feedback/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── productos/
│   │   ├── categorias/
│   │   ├── ventas/
│   │   ├── compras/
│   │   ├── movimientos-stock/
│   │   └── usuarios/
│   │
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Productos/
│   │   ├── Categorias/
│   │   ├── Ventas/
│   │   ├── Compras/
│   │   ├── MovimientosStock/
│   │   └── Usuarios/
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── productoService.ts
│   │   ├── ventaService.ts
│   │   ├── compraService.ts
│   │   └── usuarioService.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProductos.ts
│   │   └── ...
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── producto.ts
│   │   ├── venta.ts
│   │   └── usuario.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo Vite (`http://localhost:5173`).
- `npm run build`: Compila el bundle de producción y verifica los tipos con TypeScript.
- `npm run preview`: Previsualiza el bundle compilado localmente.
