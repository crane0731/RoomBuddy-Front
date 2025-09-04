<template>
  <div class="mypage">
    <h2 class="title">마이페이지</h2>

    <div class="content">
      <!-- 내 정보 -->
      <div class="card info-card" v-if="member">
        <!-- 이메일 (수정 불가) -->
        <div class="info-row">
          <span class="label">이메일</span>
          <span class="value">{{ member.email }}</span>
        </div>

        <!-- 이름 수정 -->
        <div class="info-row">
          <span class="label">이름</span>
          <span class="value">
            <input v-if="editMode.name" v-model="editName" />
            <span v-else>{{ member.name }}</span>
          </span>
<button v-if="!editMode.name" class="edit-btn" @click="startEdit('name')">수정</button>
<template v-else>
    <div class="actions">
  <button class="edit-btn" @click="updateName">저장</button>
  <button class="edit-btn cancel" @click="cancelEdit('name')">취소</button>
  </div>
</template>
        </div>

        <!-- 전화번호 수정 -->
        <div class="info-row">
          <span class="label">전화번호</span>
          <span class="value">
            <input v-if="editMode.phone" v-model="editPhone" />
            <span v-else>{{ member.phone }}</span>
          </span>
<button v-if="!editMode.phone" class="edit-btn" @click="startEdit('phone')">수정</button>
<template v-else>
    <div class="actions">
  <button class="edit-btn" @click="updatePhone">저장</button>
  <button class="edit-btn cancel" @click="cancelEdit('phone')">취소</button>
  </div>
</template>

        </div>

        <!-- 비밀번호 수정 -->
        <div class="info-row">
          <span class="label">비밀번호</span>
          <span class="value">
            <div v-if="editMode.password" class="password-edit">
              <input type="password" v-model="editPassword" placeholder="새 비밀번호" />
              <input type="password" v-model="editPasswordCheck" placeholder="비밀번호 확인" />
            </div>
            <span v-else>********</span>
          </span>
<button v-if="!editMode.password" class="edit-btn" @click="startEdit('password')">수정</button>
<template v-else>
    <div class="actions">
  <button class="edit-btn" @click="updatePassword">저장</button>
  <button class="edit-btn cancel" @click="cancelEdit('password')">취소</button>
    </div>
</template>

        </div>

        <!-- 예약 횟수 -->
        <div class="info-row">
          <span class="label">예약 횟수</span>
          <span class="value">{{ member.reservationCount }}</span>
        </div>

        <!-- 가입일 -->
        <div class="info-row">
          <span class="label">가입일</span>
          <span class="value">{{ member.createdAt }}</span>
        </div>

        <!-- 관리자 전용 버튼 -->
        <button
          v-if="member.role === 'ADMIN'"
          class="admin-btn"
          @click="goAdminPage"
        >
          관리자 페이지 이동
        </button>


<!-- 회원 탈퇴 버튼 (관리자가 아닐 때만) -->
<button
  v-if="member.role !== 'ADMIN'"
  class="withdraw-btn"
  @click="withdrawMember"
>
  회원 탈퇴
</button>

      </div>

      <!-- 내 예약 목록 -->
      <div class="card reservation-card">
        <h3>내 예약 목록</h3>
        <p v-if="loadingReservations">예약 불러오는 중...</p>
        <p v-if="reservationError" class="error">{{ reservationError }}</p>

        <ul v-if="reservations.length > 0" class="reservation-list">
          <li
            v-for="r in reservations"
            :key="r.reservationId"
            class="reservation-item"
          >
            <h4>{{ r.name }}</h4>
            <p><strong>상태:</strong> {{ statusText(r.status) }}</p>
            <p><strong>시간:</strong> {{ r.startAt }} ~ {{ r.endAt }}</p>
            <p><strong>예약 생성일:</strong> {{ r.createdAt }}</p>

            <!-- 예약 취소 버튼 (CONFIRMED 상태일 때만) -->
            <button
              v-if="r.status === 'CONFIRMED'"
              class="cancel-btn"
              @click="cancelReservation(r.reservationId)"
            >
              예약 취소
            </button>
          </li>
        </ul>

        <p v-else-if="!loadingReservations">예약 내역이 없습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";

const member = ref(null);
const reservations = ref([]);
const loadingReservations = ref(true);
const reservationError = ref("");
const router = useRouter();

/* ===== 수정 상태 ===== */
const editMode = ref({ name: false, phone: false, password: false });
const editName = ref("");
const editPhone = ref("");
const editPassword = ref("");
const editPasswordCheck = ref("");

/* ===== 내 정보 조회 ===== */
const fetchMyInfo = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8081/api/roombuddy/members/me",
      {
        headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
      }
    );
    if (res.data.success) {
      member.value = res.data.data;
      editName.value = member.value.name;
      editPhone.value = member.value.phone;
    }
  } catch (err) {
    console.error("내 정보 불러오기 실패", err);
  }
};

const withdrawMember = async () => {
  if (!confirm("정말 회원 탈퇴를 진행하시겠습니까? 😥")) return;

  try {
    const res = await axios.delete(
      "http://localhost:8081/api/roombuddy/members/me/withdraw",
      {
        headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
      }
    );

    if (res.data.success) {
      alert(res.data.data.message || "회원 탈퇴 성공 👋");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      router.push("/"); // 홈으로 이동
    }
  } catch {
    alert("회원 탈퇴 실패 ❌");
  }
};


// 수정 취소
const cancelEdit = (field) => {
  editMode.value[field] = false;
};


/* ===== 수정 모드 진입 ===== */
const startEdit = (field) => {
  editMode.value[field] = true;
};

/* ===== 이름 수정 ===== */
const updateName = async () => {
  try {
    const res = await axios.put(
      "http://localhost:8081/api/roombuddy/members/me/name",
      { name: editName.value },
      { headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } }
    );
    if (res.data.success) {
      alert(res.data.data.message || "이름 수정 성공 🎉");
      member.value.name = editName.value;
      editMode.value.name = false;
    }
  } catch {
    alert("이름 수정 실패 ❌");
  }
};

/* ===== 전화번호 수정 ===== */
const updatePhone = async () => {
  try {
    const res = await axios.put(
      "http://localhost:8081/api/roombuddy/members/me/phone",
      { phone: editPhone.value },
      { headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } }
    );
    if (res.data.success) {
      alert(res.data.data.message || "전화번호 수정 성공 🎉");
      member.value.phone = editPhone.value;
      editMode.value.phone = false;
    }
  } catch {
    alert("전화번호 수정 실패 ❌");
  }
};

/* ===== 비밀번호 수정 ===== */
const updatePassword = async () => {
  if (editPassword.value !== editPasswordCheck.value) {
    alert("비밀번호가 일치하지 않습니다 ❌");
    return;
  }
  try {
    const res = await axios.put(
      "http://localhost:8081/api/roombuddy/members/me/password",
      {
        password: editPassword.value,
        passwordCheck: editPasswordCheck.value,
      },
      { headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } }
    );
    if (res.data.success) {
      alert(res.data.data.message || "비밀번호 수정 성공 🎉");
      editPassword.value = "";
      editPasswordCheck.value = "";
      editMode.value.password = false;
    }
  } catch {
    alert("비밀번호 수정 실패 ❌");
  }
};

/* ===== 내 예약 목록 조회 ===== */
const fetchMyReservations = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8081/api/roombuddy/reservation/me",
      {
        headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
      }
    );
    if (res.data.success) reservations.value = res.data.data;
  } catch {
    reservationError.value = "예약 목록 불러오기 실패 ❌";
  } finally {
    loadingReservations.value = false;
  }
};

/* ===== 예약 취소 요청 ===== */
const cancelReservation = async (reservationId) => {
  if (!confirm("정말 예약을 취소하시겠습니까?")) return;

  try {
    const res = await axios.delete(
      `http://localhost:8081/api/roombuddy/reservation/${reservationId}`,
      {
        headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
      }
    );

    if (res.data.success) {
      alert(res.data.data.message || "예약 취소 성공 🎉");
      fetchMyReservations(); // 목록 새로고침
    }
  } catch {
    alert("예약 취소 실패 ❌");
  }
};

/* ===== 상태 텍스트 변환 ===== */
const statusText = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "예약중";
    case "COMPLETED":
      return "예약완료";
    case "CANCELLED":
      return "취소됨";
    default:
      return status;
  }
};

/* ===== 관리자 페이지 이동 ===== */
const goAdminPage = () => {
  router.push("/admin");
};

onMounted(() => {
  fetchMyInfo();
  fetchMyReservations();
});
</script>

<style scoped>
.mypage {
  max-width: 1200px;
  margin: 100px auto;
  padding: 20px;
}

.title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.content {
  display: flex;
  gap: 30px;
}

.card {
  flex: 1;
  background: #fff;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #555;
}
.value {
  color: #333;
}

.password-edit {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.admin-btn {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  background-color: #2eb84c;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
}
.admin-btn:hover {
  background-color: #39fc7a;
}

.reservation-card h3 {
  margin-bottom: 15px;
}

.reservation-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.reservation-item {
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
}
.reservation-item h4 {
  margin: 0 0 6px;
}

.cancel-btn {
  margin-top: 10px;
  padding: 8px 14px;
  background-color: #f44336;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
.cancel-btn:hover {
  background-color: #d32f2f;
}

.error {
  color: red;
  font-weight: bold;
}
.edit-btn {
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #2eb84c;
  border-radius: 6px;
  background-color: #fff;
  color: #2eb84c;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: #2eb84c;
  color: #fff;
}
.actions {
  display: flex;
  gap: 6px; /* 저장/취소 버튼 사이 간격 */
  align-items: center; /* 세로 정렬 */
}

.edit-btn.cancel {
  border: 1px solid #ccc;
  color: #555;
}
.edit-btn.cancel:hover {
  background-color: #eee;
  color: #333;
}
.withdraw-btn {
  margin-top: 15px;
  width: 100%;
  padding: 12px;
  background-color: #ff4d4f;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
}
.withdraw-btn:hover {
  background-color: #d9363e;
}


</style>
