<script lang="ts" setup>
  import { ElMessage } from 'element-plus';
  import { updateUserInfo } from '@/api';
  import useUserStore from '@/store/modules/user';
  import AvatarCropper from '@/components/AvatarCropper.vue';
  const router = useRouter();
  const cropper = ref(false);
  const { avatar, tel, username, email, gender, signature, birthday } = useUserStore().userInfo;
  const info = ref({
    tel: tel,
    email: email
  });
  const baseInfo = ref({
    avatar: avatar,
    username: username,
    gender: gender,
    signature: signature,
    birthday: birthday
  });
  const loading = ref(false);
  // 修改用户信息
  const onChangeDetail = () => {
    const { username } = baseInfo.value;
    if (!username.trim()) {
      return ElMessage({
        type: 'warning',
        message: '昵称不能为空'
      });
    }
    loading.value = true;
    updateUserInfo({
      ...baseInfo.value
    })
      .then((res) => {
        ElMessage({
          type: 'success',
          message: '修改成功'
        });
        useUserStore().userInfo = res.data;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const onUploadAvatar = (avatar) => {
    cropper.value = false;
    baseInfo.value.avatar = avatar;
    onChangeDetail();
  };
</script>

<template>
  <section class="el-container container" v-loading="loading">
    <aside class="el-aside el-aside-left">
      <el-avatar :size="200" :src="baseInfo.avatar" @click="cropper = true" class="avatar-box pointer" />
      <el-button text @click="cropper = true"> 点击修改头像 </el-button>
    </aside>

    <main class="el-main">
      <el-form ref="formRef" label-placement="left" label-width="90" style="max-width: 500px">
        <el-form-item label="登录账号：">
          {{ info.tel.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}
          <el-button class="ml5px" type="primary" text @click="router.push('/settings/security')"> 修改 </el-button>
        </el-form-item>
        <el-form-item label="电子邮箱：">
          {{ info.email || '暂无' }}
          <el-button class="ml5px" type="primary" text @click="router.push('/settings/security')"> 修改 </el-button>
        </el-form-item>
        <el-form-item label="我的昵称：">
          <el-input placeholder="我的昵称" v-model="baseInfo.username" maxlength="20" show-count />
        </el-form-item>
        <el-form-item label="我的性别：">
          <el-radio-group v-model="baseInfo.gender">
            <el-radio :label="1"> 男 </el-radio>
            <el-radio :label="2"> 女 </el-radio>
            <el-radio :label="0"> 保密 </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="我的生日：">
          <el-date-picker
            v-model="baseInfo.birthday"
            value-format="YYYY-MM-DD"
            style="width: 180px"
            type="date"
            format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="个性签名：">
          <el-input
            placeholder="编辑个签，展示我的独特态度"
            type="textarea"
            maxlength="500"
            show-count
            v-model="baseInfo.signature"
            :autosize="{
              minRows: 3,
              maxRows: 5
            }"
          />
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="onChangeDetail"> 保存修改 </el-button>
        </el-form-item>
      </el-form>
    </main>
  </section>

  <!-- 头像裁剪组件 -->
  <AvatarCropper v-if="cropper" @close="cropper = false" @success="onUploadAvatar" />
</template>

<style lang="scss" scoped>
  .container {
    height: auto;
  }

  .el-aside-left {
    width: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
    margin-right: 10px;
  }

  .avatar-box {
    background-color: #f5f5f5;
    border-radius: 10px;
    margin-bottom: 20px;
  }
</style>
