import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import './style/global.css';
import '@ant-design/v5-patch-for-react-19';
// import 'antd/dist/reset.css';
import 'antd/dist/reset.css'; // 使用 AntD v5 推荐样式
// import './style/global.css';  // Tailwind 的入口



createRoot(document.getElementById('root')!).render(
      <RouterProvider router={router} />
)
