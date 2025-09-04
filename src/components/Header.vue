<template>
  <header class="header">
    <h1 class="logo">
  <router-link to="/">RoomBuddy</router-link>
</h1>

    <!-- 로그인 상태 아닐 때 -->
    <button v-if="!isLoggedIn" class="login-btn" @click="showLogin = true">
      로그인
    </button>

    <!-- 로그인 상태일 때 -->
    <div v-else class="user-actions">
      <button class="mypage-btn" @click="goToMyPage">마이페이지</button>
      <button class="logout-btn" @click="logout">로그아웃</button>
    </div>

    <!-- ✅ 로그인 모달 -->
    <div v-if="showLogin" class="modal-overlay" @click.self="closeAll">
      <div class="modal">
        <h2 class="modal-title">로그인</h2>
        <form class="modal-form" @submit.prevent="login">
          <input type="text" placeholder="아이디" v-model="username" />
          <input type="password" placeholder="비밀번호" v-model="password" />
          <button type="submit" class="confirm-btn">로그인</button>
          <button type="button" class="cancel-btn" @click="closeAll">취소</button>
        </form>

        <!-- 회원가입 버튼 -->
        <div class="signup-section">
          <p>아직 계정이 없으신가요?</p>
          <button class="signup-btn" @click="switchToSignup">회원가입</button>
        </div>
      </div>
    </div>

    <!-- ✅ 회원가입 모달 -->
    <div v-if="showSignup" class="modal-overlay" @click.self="closeAll">
      <div class="modal">
        <h2 class="modal-title">회원가입</h2>
        <form class="modal-form" @submit.prevent="signup">
          <input type="email" placeholder="이메일" v-model="signupEmail" />

          <!-- 이메일 인증 -->
          <div class="email-verify">
            <button type="button" @click="sendEmail" :disabled="emailSent">
              인증 메일 보내기
            </button>
          </div>
          <div v-if="emailSent">
            <input type="text" placeholder="인증 코드 입력" v-model="emailCode" />
            <button
              type="button"
              @click="validateEmail"
              :disabled="isEmailVerified"
            >
              {{ isEmailVerified ? "인증 완료" : "인증 확인" }}
            </button>
          </div>

          <input type="password" placeholder="비밀번호" v-model="signupPassword" />
          <input type="password" placeholder="비밀번호 확인" v-model="signupPasswordCheck" />
          <input type="text" placeholder="이름" v-model="signupName" />
          <input type="text" placeholder="전화번호" v-model="signupPhone" />

          <button type="submit" class="confirm-btn">회원가입</button>
          <button type="button" class="cancel-btn" @click="closeAll">취소</button>
        </form>

        <!-- 로그인으로 돌아가기 -->
        <div class="signup-section">
          <p>이미 계정이 있으신가요?</p>
          <button class="signup-btn" @click="switchToLogin">로그인</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import axios from "axios";
import { ref, onMounted } from "vue";
import Cookies from "js-cookie";

/* ===== 상태 ===== */
const showLogin = ref(false);
const showSignup = ref(false);
const isLoggedIn = ref(false);

/* ===== 로그인 값 ===== */
const username = ref("");
const password = ref("");

/* ===== 회원가입 값 ===== */
const signupEmail = ref("");
const signupPassword = ref("");
const signupPasswordCheck = ref("");
const signupName = ref("");
const signupPhone = ref("");
const emailCode = ref("");
const emailSent = ref(false);
const isEmailVerified = ref(false);

/* ===== 라우터 ===== */
const router = useRouter();
const goToMyPage = () => {
  router.push("/mypage");
};

/* ===== 새로고침 시 로그인 상태 복원 ===== */
onMounted(() => {
  const token = Cookies.get("accessToken");
  if (token) {
    isLoggedIn.value = true;
  }
});

/* ===== 모달 닫기 ===== */
const closeAll = () => {
  showLogin.value = false;
  showSignup.value = false;
};

/* ===== 로그인 ===== */
const login = async () => {
  try {
    const res = await axios.post("http://localhost:8081/api/roombuddy/auth/login", {
      email: username.value,
      password: password.value,
    });

    if (res.data.success) {
      const { accessToken, refreshToken } = res.data.data;

      Cookies.set("accessToken", accessToken, { expires: 1, secure: false }); // 개발 환경 secure:false
      Cookies.set("refreshToken", refreshToken, { expires: 7, secure: false });

      alert("로그인 성공 🎉");
      isLoggedIn.value = true;
      closeAll();
    }
  } catch (err) {
    alert(err.response?.data?.message || "로그인 실패");
  }
};

/* ===== 로그아웃 ===== */
const logout = async () => {
  try {
    const res = await axios.post(
      "http://localhost:8081/api/roombuddy/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessToken")}`,
        },
      }
    );

    if (res.data.success) {
      alert(res.data.data.message || "로그아웃 성공 👋");
    }
  } catch (err) {
    alert("서버 로그아웃 실패 ❌");
  } finally {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    isLoggedIn.value = false;
  }
};

/* ===== 이메일 인증 요청 ===== */
const sendEmail = async () => {
  try {
    const res = await axios.post("http://localhost:8081/api/roombuddy/auth/signup/email", {
      email: signupEmail.value,
    });
    alert(res.data.data.message || "인증 메일 전송 성공");
    emailSent.value = true;
  } catch (err) {
    alert("이메일 전송 실패");
  }
};

/* ===== 이메일 코드 확인 ===== */
const validateEmail = async () => {
  try {
    const res = await axios.post("http://localhost:8081/api/roombuddy/auth/signup/email/validate", {
      email: signupEmail.value,
      code: emailCode.value,
    });
    alert(res.data.data.message || "이메일 인증 성공");
    isEmailVerified.value = true;
  } catch (err) {
    alert("이메일 인증 실패");
  }
};

/* ===== 회원가입 요청 ===== */
const signup = async () => {
  if (!isEmailVerified.value) {
    alert("이메일 인증을 먼저 완료해주세요.");
    return;
  }

  if (signupPassword.value !== signupPasswordCheck.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    await axios.post("http://localhost:8081/api/roombuddy/auth/signup", {
      email: signupEmail.value,
      password: signupPassword.value,
      passwordCheck: signupPasswordCheck.value,
      name: signupName.value,
      phone: signupPhone.value,
    });
    alert("회원가입 성공 🎉");
    closeAll();
  } catch (err) {
    alert(err.response?.data?.message || "회원가입 실패");
  }
};

/* ===== 모달 전환 ===== */
const switchToSignup = () => {
  showLogin.value = false;
  showSignup.value = true;
};
const switchToLogin = () => {
  showSignup.value = false;
  showLogin.value = true;
};
</script>

<style scoped>
/* ===== 헤더 ===== */
.header {
  width: 100%;
  background-color: #42b883;
  height: 60px;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.logo {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: white;
  position: absolute;
  left: 20px;
}

.logo a {
  color: white;
  text-decoration: none;
}

.login-btn {
  background: white;
  border: none;
  padding: 6px 14px;
  border-radius: 5px;
  cursor: pointer;
  color: #42b883;
  font-weight: bold;
  font-size: 14px;
  position: absolute;
  right: 60px;
}
.login-btn:hover {
  background: #f0f0f0;
}

/* ===== 모달 공통 ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal {
  background: white;
  padding: 30px 25px;
  border-radius: 12px;
  width: 350px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
}

.modal-title {
  margin-bottom: 20px;
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-form input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.confirm-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
}

.confirm-btn:hover {
  background: #369c6d;
}

.cancel-btn {
  background: #eee;
  color: #333;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #ddd;
}

/* ===== 전환 섹션 ===== */
.signup-section {
  margin-top: 20px;
  text-align: center;
}

.signup-section p {
  font-size: 13px;
  color: #555;
  margin-bottom: 8px;
}

.signup-btn {
  background: transparent;
  border: 1px solid #42b883;
  color: #42b883;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.signup-btn:hover {
  background: #42b883;
  color: white;
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 이메일 인증 버튼 */
.email-verify {
  margin-bottom: 10px;
  text-align: right;
}

.email-verify button {
  background: #42b883;
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
}

.email-verify button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.user-actions {
  position: absolute;
  right: 20px;
  display: flex;
  gap: 10px;
}

.mypage-btn,
.logout-btn {
  background: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  color: #42b883;
  font-weight: bold;
  font-size: 14px;
}

.mypage-btn:hover,
.logout-btn:hover {
  background: #f0f0f0;
}
</style>
