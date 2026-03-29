<template>
  <div class="flex min-h-screen bg-primary-900">
    <div class="flex w-full md:w-1/2 flex-col justify-center px-8 py-12">
      <div class="mx-auto w-full max-w-md space-y-6">
        <h6 class="text-4xl font-black text-primary-0 text-center">註冊</h6>
        <p class="text-xl text-center text-primary-300">還差最後一步！加入我們健身行列</p>
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-lg font-medium text-primary-0"
              >電子郵件 <span class="text-secondary-800">*</span></label
            >
            <input
              id="email"
              type="email"
              v-model="user.email"
              @keyup.enter="signup"
              class="px-4 py-2 bg-primary-800 border border-primary-600 rounded-lg focus:outline-none focus:border-secondary-800 text-primary-0"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="text-lg font-medium text-primary-0"
              >密碼 <span class="text-secondary-800">*</span></label
            >
            <input
              id="password"
              type="password"
              v-model="user.password"
              @keyup.enter="signup"
              class="px-4 py-2 bg-primary-800 border border-primary-600 rounded-lg focus:outline-none focus:border-secondary-800 text-primary-0"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label
              for="confirmPassword"
              class="text-lg font-medium text-primary-0"
              >再次輸入密碼 <span class="text-secondary-800">*</span></label
            >
            <input
              id="confirmPassword"
              type="password"
              v-model="user.confirmPassword"
              @keyup.enter="signup"
              class="px-4 py-2 bg-primary-800 border border-primary-600 rounded-lg focus:outline-none focus:border-secondary-800 text-primary-0"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="nickname" class="text-lg font-medium text-primary-0"
              >暱稱 <span class="text-secondary-800">*</span></label
            >
            <input
              id="nickname"
              type="text"
              v-model="user.name"
              @keyup.enter="signup"
              class="px-4 py-2 bg-primary-800 border border-primary-600 rounded-lg focus:outline-none focus:border-secondary-800 text-primary-0"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="birthday" class="text-lg font-medium text-primary-0"
              >生日</label
            >
            <input
              id="birthday"
              type="date"
              v-model="user.birthday"
              @keyup.enter="signup"
              class="px-4 py-2 bg-primary-800 border border-primary-600 rounded-lg focus:outline-none focus:border-secondary-800 text-primary-0"
            />
            <p v-if="birthdayError" class="text-sm text-red-400">
              {{ birthdayError }}
            </p>
          </div>

          <button
            @click="signup"
            :disabled="isLoading || !!birthdayError"
            class="w-full bg-secondary-800 text-primary-900 text-lg py-2 mt-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "註冊中..." : "註冊" }}
          </button>

          <p class="text-center text-sm text-primary-400">
            已有會員?
            <router-link
              to="/login"
              class="text-secondary-800 font-medium hover:underline"
              >前往登入</router-link
            >
          </p>
        </div>
      </div>
    </div>

    <div class="hidden md:flex md:w-1/2 md:py-16 md:pr-8">
      <img
        src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1200&auto=format&fit=crop"
        alt="進入健身房"
        class="w-full object-cover rounded-lg"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { postSignup } from "../../../api/index.js";
import swalHandler from "../../../utils/swalHandler.js";

const { proxy } = getCurrentInstance();
const router = useRouter();

const user = ref({
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  birthday: "",
});

const isLoading = ref(false);

const birthdayError = computed(() => {
  if (!user.value.birthday) {
    return "";
  }

  const birthday = new Date(user.value.birthday);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 檢查是否為未來日期
  if (birthday > today) {
    return "生日不能是未來日期";
  }

  // 計算年齡
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDifference = today.getMonth() - birthday.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthday.getDate())
  ) {
    age--;
  }

  // 檢查年齡限制（至少 13 歲）
  if (age < 13) {
    return "必須年滿 13 歲才能註冊";
  }

  return "";
});

// 驗證密碼是否一致
function validatePasswordMatch() {
  if (user.value.password !== user.value.confirmPassword) {
    swalHandler(proxy.$swal, "密碼不一致");
    return false;
  }
  return true;
}

async function signup() {
  // 驗證密碼是否一致
  if (!validatePasswordMatch()) {
    return;
  }

  // 驗證生日
  if (birthdayError.value) {
    swalHandler(proxy.$swal, birthdayError.value);
    return;
  }

  isLoading.value = true;

  try {
    const signupData = {
      email: user.value.email,
      password: user.value.password,
      name: user.value.name,
    };

    // 只在填入生日時才包含到請求中
    if (user.value.birthday) {
      signupData.birthday = user.value.birthday;
    }

    const { status } = await postSignup(signupData);
    if (status === "success") {
      swalHandler(proxy.$swal, "註冊成功");

      setTimeout(() => {
        proxy.$swal.close();
        router.push("/login");
      }, 3000);
    }
  } catch (error) {
    let msg = error.message;

    if (Object.hasOwn(error.response, "data")) {
      const { status, message } = error.response.data;
      msg = message;

      if (status === "failed") {
        swalHandler(proxy.$swal, message);
        isLoading.value = false;
        return;
      }
    }

    isLoading.value = false;
    throw new Error(`[signup] error : ${msg}`);
  }
}
</script>
