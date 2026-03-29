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
              :max="todayString"
              @keyup.enter="signup"
              placeholder="YYYY-MM-DD"
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

// 計算今天的日期字符串（用於 date input 的 max 屬性）
const todayString = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

// 前端只做基礎格式驗證，詳細驗證由後端處理
const birthdayError = computed(() => {
  if (!user.value.birthday) {
    return "" // 生日欄位為可選
  }

  // 只驗證日期格式
  const BIRTHDAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/
  if (!BIRTHDAY_FORMAT.test(user.value.birthday)) {
    return "日期格式不正確，應為 YYYY-MM-DD"
  }

  // 驗證日期是否有效（避免 02-30 等無效日期）
  const [year, month, day] = user.value.birthday.split("-")
  const testDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  if (
    testDate.getFullYear() !== parseInt(year) ||
    testDate.getMonth() !== parseInt(month) - 1 ||
    testDate.getDate() !== parseInt(day)
  ) {
    return "生日日期無效"
  }

  return ""
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

  // 驗證生日（前端基礎驗證）
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

    // 優先使用後端的詳細驗證訊息（年齡、日期等）
    if (Object.hasOwn(error.response, "data")) {
      const { status, message } = error.response.data;
      msg = message;

      if (status === "failed") {
        swalHandler(proxy.$swal, message);
        return;
      }
    }

    swalHandler(proxy.$swal, "註冊失敗，請重試");
    throw new Error(`[signup] error : ${msg}`);
  } finally {
    isLoading.value = false;
  }
}
</script>
