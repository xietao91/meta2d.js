import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

import router from './router.ts';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

// 加载基础服务
app.use(router).use(Antd);
// end

app.mount('#app');
