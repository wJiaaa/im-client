<!--
 * @Description: 登录表单
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 * @LastEditTime: 2024-04-28 22:55:43
-->
<template>
  <el-form ref="loginFormRef" :label-width="70" :model="loginForm" :rules="rules" size="large">
    <el-form-item v-if="register" label="用户名" prop="username">
      <el-input v-model="loginForm.username" placeholder="请输入用户名" clearable />
    </el-form-item>
    <el-form-item label="手机号" prop="tel">
      <el-input v-model="loginForm.tel" placeholder="请输入手机号" clearable />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="loginForm.password" placeholder="请输入密码" clearable />
    </el-form-item>
    <el-form-item v-if="!register" label="验证码" prop="code">
      <span class="login_code">
        <el-input v-model="loginForm.code" placeholder="验证码" @keyup.enter="login" clearable />
        <div class="code" @click="getCode" v-html="code"></div>
      </span>
    </el-form-item>
  </el-form>
  <div class="login-btn">
    <el-button
      @click="
        register = !register;
        loginFormRef?.clearValidate();
      "
      size="large"
    >
      {{ register ? '返回' : '注册' }}
    </el-button>
    <el-button @click="login(loginFormRef)" size="large" type="primary" :loading="loading">
      {{ register ? '确认注册' : '登录' }}
    </el-button>
  </div>
  <div class="text-center" v-if="!register">
    <div class="mt40px text-16px" @click="loginForm.tel = '13647699752'">测试账号: 13647699752 123456</div>
    <div class="mt5px text-16px" @click="loginForm.tel = '13663492187'">测试账号: 13663492187 123456</div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus';
  import useUserStore from '@/store/modules/user';
  import { getQrCode } from '@/api';
  const router = useRouter();

  const loginFormRef = ref();
  const register = ref(false);
  const rules = ref({
    tel: [
      {
        required: true,
        trigger: 'submit',
        message: '请输入手机号'
      }
    ],
    username: [
      {
        required: true,
        trigger: 'submit',
        message: '请输入用户名'
      }
    ],
    password: [
      {
        required: true,
        trigger: 'submit',
        message: '请输入密码'
      }
    ],
    code: [
      {
        required: true,
        trigger: 'submit',
        message: '请输入验证码'
      }
    ]
  });
  // 登录表单数据
  const loginForm = reactive<
    Pick<User, 'tel' | 'password'> & {
      code?: number;
      username?: string;
    }
  >({
    tel: '',
    password: '123456',
    code: undefined
  });

  const code = ref<any>();
  const loading = ref<boolean>(false);
  /**
   * @Description 获取二维码
   */
  const getCode = () => {
    getQrCode().then((res) => {
      code.value = res;
    });
  };
  /**
   * @Description 登陆
   */
  const login = async (formEl: any) => {
    if (!formEl) return;
    formEl.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true;
        const api = register.value ? useUserStore().register : useUserStore().login;
        api(loginForm)
          .then(() => {
            ElMessage({
              message: register.value ? '注册成功' : '登录成功',
              type: 'success'
            });
            if (register.value) {
              register.value = !register.value;
            } else {
              router.push({ name: 'home' });
            }
          })
          .catch(() => {
            loginForm.code = void 0;
            getCode();
          })
          .finally(() => {
            loading.value = false;
          });
      }
    });
  };
  getCode();
</script>

<style scoped lang="scss">
  .login-btn {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 40px;
    white-space: nowrap;

    .el-button {
      width: 185px;
    }
  }

  .login_code {
    display: flex;
    width: 100%;
  }

  .code {
    height: 40px;
    margin-left: 30px;
    cursor: pointer;

    svg {
      height: 40px;
    }
  }
</style>
