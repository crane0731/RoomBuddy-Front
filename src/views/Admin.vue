<template>
  <div class="admin-page">
    <h2 class="title">관리자 페이지</h2>

    <div class="dashboard">
      <!-- 사이드 메뉴 -->
      <aside class="sidebar">
        <ul>
          <li @click="activeMenu = 'members'" :class="{active: activeMenu==='members'}">회원 관리</li>
          <li @click="activeMenu = 'reservations'" :class="{active: activeMenu==='reservations'}">예약 관리</li>
          <li @click="activeMenu = 'rooms'" :class="{active: activeMenu==='rooms'}">스터디룸 관리</li>
           <li @click="activeMenu = 'blackouts'" :class="{active: activeMenu==='blackouts'}">블랙아웃 관리</li>
        </ul>
      </aside>

      <!-- 콘텐츠 -->
      <main class="content">
        <!-- 회원 관리 -->
        <div v-if="activeMenu === 'members'">
          <h3>회원 관리</h3>

          <!-- 검색 -->
          <div class="filters">
            <input v-model="searchName" placeholder="이름 검색" />
            <input v-model="searchEmail" placeholder="이메일 검색" />
            <select v-model="sortType">
              <option value="">정렬 없음</option>
              <option value="HIGH_RESERVATION">예약 많은 순</option>
              <option value="LOW_RESERVATION">예약 적은 순</option>
              <option value="CREATED_ASC">가입 오래된 순</option>
              <option value="CREATED_DESC">가입 최신 순</option>
            </select>
            <button @click="fetchMembers(0)">검색</button>
          </div>

         <!-- 회원 테이블 -->
<table class="member-table">
  <thead>
    <tr>
      <th>아이디</th>
      <th>이메일</th>
      <th>이름</th>
      <th>예약 횟수</th>
      <th>관리</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="m in members" :key="m.memberId">
      <td>{{ m.memberId }}</td>
      <td>{{ m.email }}</td>
      <td>{{ m.name }}</td>
      <td>{{ m.reservationCount }}</td>
      <td>
        <button class="detail-btn" @click="getMemberInfo(m.memberId)">상세보기</button>
        <button class="delete-btn" @click="deleteMember(m.memberId)">삭제</button>
      </td>
    </tr>
  </tbody>
</table>

<!-- 회원 상세 모달 -->
<div v-if="selectedMember" class="modal-overlay" @click.self="selectedMember=null">
  <div class="modal">
    <h3>회원 상세 정보</h3>
    <p><strong>아이디:</strong> {{ selectedMember.memberId }}</p>
    <p><strong>이메일:</strong> {{ selectedMember.email }}</p>
    <p><strong>이름:</strong> {{ selectedMember.name }}</p>
    <p><strong>전화번호:</strong> {{ selectedMember.phone }}</p>
    <p><strong>권한:</strong> {{ selectedMember.role }}</p>
    <p><strong>예약 횟수:</strong> {{ selectedMember.reservationCount }}</p>
    <p><strong>가입일:</strong> {{ selectedMember.createdAt }}</p>
    <button class="close-btn" @click="selectedMember=null">닫기</button>
  </div>
</div>


          <!-- 페이지네이션 -->
          <div class="pagination">
            <button :disabled="page === 0" @click="fetchMembers(page - 1)">이전</button>

            <button
              v-for="p in totalPages"
              :key="p"
              :class="['page-btn', { active: p - 1 === page }]"
              @click="fetchMembers(p - 1)"
            >
              {{ p }}
            </button>

            <button :disabled="page === totalPages - 1" @click="fetchMembers(page + 1)">다음</button>
          </div>
        </div>

  <!-- 예약 관리 -->
<div v-if="activeMenu === 'reservations'">
  <h3>현재 진행중인 예약</h3>

  

  <!-- 필터 -->
  <div class="filters">
    <input v-model="reservationEmail" placeholder="회원 이메일 검색" />
    <select v-model="reservationStatus">
      <option value="">상태 전체</option>
      <option value="CONFIRMED">예약중</option>
      <option value="COMPLETED">완료</option>
      <option value="CANCELLED">취소됨</option>
    </select>
    <button @click="fetchReservations(0)">검색</button>
  </div>

  <!-- 예약 목록 테이블 -->
  <table class="reservation-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>회원명</th>
        <th>이메일</th>
        <th>시작 시간</th>
        <th>종료 시간</th>
        <th>상태</th>
        <th>관리</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in reservations" :key="r.reservationId">
        <td>{{ r.reservationId }}</td>
        <td>{{ r.name }}</td>
        <td>{{ r.email }}</td>
        <td>{{ r.startAt }}</td>
        <td>{{ r.endAt }}</td>
        <td>
          <span :class="{
            confirmed: r.status==='CONFIRMED',
            completed: r.status==='COMPLETED',
            cancelled: r.status==='CANCELLED'
          }">
            {{ statusText(r.status) }}
          </span>
        </td>
        <td>
          <button v-if="r.status==='CONFIRMED'" class="delete-btn" @click="cancelReservation(r.reservationId)">취소</button>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- 페이지네이션 -->
  <div class="pagination">
    <button :disabled="reservationPage===0" @click="fetchReservations(reservationPage-1)">이전</button>

    <button
      v-for="p in reservationTotalPages"
      :key="p"
      :class="['page-btn', { active: p-1===reservationPage }]"
      @click="fetchReservations(p-1)"
    >
      {{ p }}
    </button>

    <button :disabled="reservationPage===reservationTotalPages-1" @click="fetchReservations(reservationPage+1)">다음</button>
  </div>
</div>


        
<!-- 스터디룸 관리 -->
<div v-if="activeMenu === 'rooms'">
  <h3>스터디룸 관리</h3>

  <!-- 상단 액션 -->
  <div class="room-actions">
    <button class="create-btn" @click="showCreateModal = true">+ 스터디룸 생성</button>
  </div>

  <!-- 룸 목록 테이블 -->
  <table class="room-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>이름</th>
        <th>정원</th>
        <th>이용시간</th>
        <th>상태</th>
        <th>관리</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in rooms" :key="r.roomId">
        <td>{{ r.roomId }}</td>
        <td>{{ r.name }}</td>
        <td>{{ r.capacity }}명</td>
        <td>{{ r.openTime }} ~ {{ r.closeTime }}</td>
        <td>
          <span v-if="r.available" class="available">예약 가능</span>
          <span v-else class="unavailable">예약 불가</span>
        </td>
        <td>
          <button class="detail-btn" @click="openUpdateModal(r)">수정</button>
          <button class="delete-btn" @click="deleteRoom(r.roomId)">삭제</button>
          <!-- ✅ 예약 로그 버튼 -->
          <button class="log-btn" @click="openReservationLog(r.roomId)">예약 로그</button>
          <button class="blackout-btn" @click="openBlackoutLog(r.roomId)">블랙아웃 로그</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ✅ 예약 로그 모달 -->
<div v-if="showReservationLogModal" class="modal-overlay" @click.self="closeReservationLog">
  <div class="modal modern wide">
    <h3 class="modal-title">예약 로그</h3>

    <table class="reservation-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>회원명</th>
          <th>이메일</th>
          <th>시작 시간</th>
          <th>종료 시간</th>
          <th>상태</th>
          <th>생성일</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in reservationLogs" :key="log.reservationId">
          <td>{{ log.reservationId }}</td>
          <td>{{ log.name }}</td>
          <td>{{ log.email }}</td>
          <td>{{ log.startAt }}</td>
          <td>{{ log.endAt }}</td>
          <td>
            <span :class="{
              confirmed: log.status==='CONFIRMED',
              completed: log.status==='COMPLETED',
              cancelled: log.status==='CANCELLED'
            }">
              {{ statusText(log.status) }}
            </span>
          </td>
          <td>{{ log.createdAt }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button :disabled="reservationLogPage===0" @click="fetchReservationsByRoom(currentRoomId, reservationLogPage-1)">이전</button>

      <button
        v-for="p in reservationLogTotalPages"
        :key="p"
        :class="['page-btn', { active: p-1===reservationLogPage }]"
        @click="fetchReservationsByRoom(currentRoomId, p-1)"
      >
        {{ p }}
      </button>

      <button :disabled="reservationLogPage===reservationLogTotalPages-1" @click="fetchReservationsByRoom(currentRoomId, reservationLogPage+1)">다음</button>
    </div>

    <div class="modal-actions">
      <button class="btn btn-secondary" @click="closeReservationLog">닫기</button>
    </div>
  </div>
</div>


<!-- ✅ 스터디룸 수정 모달 -->
<div v-if="showUpdateModal" class="modal-overlay" @click.self="closeUpdateModal">
  <div class="modal modern">
    <h3 class="modal-title">스터디룸 수정</h3>

    <div class="form-group">
      <label>이름</label>
      <input v-model="updateRoomData.name" class="input" />
    </div>

    <div class="form-group">
      <label>정원</label>
      <input type="number" v-model="updateRoomData.capacity" class="input" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>운영 시작 시간</label>
        <input type="time" v-model="updateRoomData.openTime" class="input" />
      </div>
      <div class="form-group">
        <label>운영 종료 시간</label>
        <input type="time" v-model="updateRoomData.closeTime" class="input" />
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-primary" @click="updateRoom">저장</button>
      <button class="btn btn-secondary" @click="closeUpdateModal">취소</button>
    </div>
  </div>
</div>


<!-- ✅ 스터디룸 생성 모달 -->
<div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
  <div class="modal modern">
    <h3 class="modal-title">스터디룸 생성</h3>

    <div class="form-group">
      <label>이름</label>
      <input v-model="newRoom.name" class="input" placeholder="예: 201호" />
    </div>

    <div class="form-group">
      <label>정원</label>
      <input type="number" v-model="newRoom.capacity" class="input" placeholder="예: 4" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>운영 시작 시간</label>
        <input type="time" v-model="newRoom.openTime" class="input" />
      </div>
      <div class="form-group">
        <label>운영 종료 시간</label>
        <input type="time" v-model="newRoom.closeTime" class="input" />
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-primary" @click="createRoom">생성</button>
      <button class="btn btn-secondary" @click="closeCreateModal">취소</button>
    </div>
  </div>
</div>


<main class="content">
  <!-- 🔹 진행중인 & 예정된 블랙아웃 -->
  <div v-if="activeMenu === 'blackouts'">
    <h3>진행중인 & 예정된 블랙아웃</h3>

    <!-- 생성 버튼 -->
    <div class="room-actions">
      <button class="create-btn" @click="showBlackoutCreateModal = true">+ 블랙아웃 생성</button>
    </div>

    <!-- 목록 테이블 -->
    <table class="room-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>범위</th>
          <th>이유</th>
          <th>시작</th>
          <th>종료</th>
          <th>생성일</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in blackouts" :key="b.blackoutId">
          <td>{{ b.blackoutId }}</td>
          <td>{{ b.scope }}</td>
          <td>{{ b.reason }}</td>
          <td>{{ b.startAt }}</td>
          <td>{{ b.endAt }}</td>
          <td>{{ b.createdAt }}</td>
          <td>
            <button class="delete-btn" @click="deleteBlackout(b.blackoutId)">제거</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 페이징 -->
    <div class="pagination">
      <button :disabled="blackoutPage===0" @click="fetchBlackouts(blackoutPage-1)">이전</button>
      <button
        v-for="p in blackoutTotalPages"
        :key="p"
        :class="['page-btn', { active: p-1===blackoutPage }]"
        @click="fetchBlackouts(p-1)"
      >
        {{ p }}
      </button>
      <button :disabled="blackoutPage===blackoutTotalPages-1" @click="fetchBlackouts(blackoutPage+1)">다음</button>
    </div>
  </div>
</main>

<!-- 🔹 블랙아웃 생성 모달 -->
<div v-if="showBlackoutCreateModal" class="modal-overlay" @click.self="closeBlackoutCreateModal">
  <div class="modal modern wide">
    <h3 class="modal-title">블랙아웃 생성</h3>

    <!-- 폼 -->
    <div class="form-group">
      <label>범위</label>
      <select v-model="newBlackout.scope" class="input">
        <option disabled value="">선택하세요</option>
        <option value="GLOBAL">전체 (GLOBAL)</option>
        <option value="ROOM">스터디룸 (ROOM)</option>
      </select>
    </div>

    <div class="form-group" v-if="newBlackout.scope === 'ROOM'">
      <label>스터디룸 ID</label>
      <input type="number" v-model="newBlackout.roomId" class="input" placeholder="예: 3" />
    </div>

    <div class="form-group">
      <label>이유</label>
      <input v-model="newBlackout.reason" class="input" placeholder="예: 공사 / 정기 점검" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>시작 시간</label>
        <input type="datetime-local" v-model="newBlackout.startAt" class="input" />
      </div>
      <div class="form-group">
        <label>종료 시간</label>
        <input type="datetime-local" v-model="newBlackout.endAt" class="input" />
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="modal-actions">
      <button class="btn btn-primary" @click="createBlackout">생성</button>
      <button class="btn btn-secondary" @click="closeBlackoutCreateModal">취소</button>
    </div>
  </div>
</div>

<!-- ✅ 블랙아웃 로그 모달 -->
<div v-if="showBlackoutLogModal" class="modal-overlay" @click.self="closeBlackoutLog">
  <div class="modal wide">
    <h3 class="modal-title">블랙아웃 로그</h3>
    <table class="reservation-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>범위</th>
          <th>이유</th>
          <th>시작 시간</th>
          <th>종료 시간</th>
          <th>생성일</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in blackoutLogs" :key="b.blackoutId">
          <td>{{ b.blackoutId }}</td>
          <td>{{ b.scope }}</td>
          <td>{{ b.reason }}</td>
          <td>{{ b.startAt }}</td>
          <td>{{ b.endAt }}</td>
          <td>{{ b.createdAt }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button :disabled="blackoutPage===0" @click="fetchBlackoutsByRoom(blackoutRoomId, blackoutPage-1)">이전</button>
      <button
        v-for="p in blackoutTotalPages"
        :key="p"
        :class="['page-btn', { active: p-1===blackoutPage }]"
        @click="fetchBlackoutsByRoom(blackoutRoomId, p-1)"
      >
        {{ p }}
      </button>
      <button :disabled="blackoutPage===blackoutTotalPages-1" @click="fetchBlackoutsByRoom(blackoutRoomId, blackoutPage+1)">다음</button>
    </div>

    <div class="modal-actions">
      <button class="btn btn-secondary" @click="closeBlackoutLog">닫기</button>
    </div>
  </div>
</div>


      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Cookies from "js-cookie";
import api from "@/api/axios";
const activeMenu = ref("members");

/* ===== 회원 관리 상태 ===== */
const members = ref([]);
const page = ref(0);
const totalPages = ref(1);

const searchName = ref("");
const searchEmail = ref("");
const sortType = ref("");

/* ===== 예약 관리 상태 ===== */
const reservations = ref([]);
const reservationPage = ref(0);
const reservationTotalPages = ref(1);

const reservationEmail = ref("");
const reservationStatus = ref("");

const reservationRoomId = ref(""); // 선택된 룸 ID

const showReservationLogModal = ref(false);
const reservationLogs = ref([]);
const reservationLogPage = ref(0);
const reservationLogTotalPages = ref(1);
const currentRoomId = ref(null);

const showBlackoutLogModal = ref(false);
const blackoutLogs = ref([]);
const blackoutRoomId = ref(null);
const blackoutPage = ref(0);
const blackoutTotalPages = ref(1);
/* ===== 블랙아웃 관리 상태 ===== */
const blackouts = ref([]);
const showBlackoutCreateModal = ref(false);
const newBlackout = ref({
  scope: "",
  roomId: null,
  reason: "",
  startAt: "",
  endAt: ""
});
const fetchBlackouts = async (p = 0) => {
  try {
    const res = await api.get("/admin/blackout", {
      params: { page: p },
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` }
    });

    if (res.data.success) {
      blackouts.value = res.data.data.content;
      blackoutPage.value = res.data.data.page;
      blackoutTotalPages.value = res.data.data.totalPages;
    }
  } catch (err) {
    alert("블랙아웃 목록 불러오기 실패 ❌");
  }
};




/* 특정 룸 예약 로그 열기 */
const openReservationLog = (roomId) => {
  currentRoomId.value = roomId;
  showReservationLogModal.value = true;
  fetchReservationsByRoom(roomId, 0);
};

const closeReservationLog = () => {
  showReservationLogModal.value = false;
  reservationLogs.value = [];
  currentRoomId.value = null;
};

/* 특정 룸 예약 로그 조회 */
const fetchReservationsByRoom = async (roomId, p = 0) => {
  try {
    const res = await api.get(`/admin/reservation/rooms/${roomId}`, {
      params: {
        memberEmail: reservationEmail.value || null,
        status: reservationStatus.value || null,
        page: p
      },
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` }
    });

    if (res.data.success) {
      reservationLogs.value = res.data.data.content;
      reservationLogPage.value = res.data.data.page;
      reservationLogTotalPages.value = res.data.data.totalPages;
    }
  } catch (err) {
    alert("예약 로그 불러오기 실패 ❌");
  }
};


/* 블랙아웃 로그 조회 */
const fetchBlackoutsByRoom = async (roomId, p = 0) => {
  try {
    const res = await api.get(`/admin/blackout/rooms/${roomId}`, {
      params: { page: p },
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` }
    });
    if (res.data.success) {
      blackoutLogs.value = res.data.data.content;
      blackoutPage.value = res.data.data.page;
      blackoutTotalPages.value = res.data.data.totalPages;
    }
  } catch (err) {
    alert("블랙아웃 로그 불러오기 실패 ❌");
  }
};

const openBlackoutLog = (roomId) => {
  blackoutRoomId.value = roomId;
  showBlackoutLogModal.value = true;
  fetchBlackoutsByRoom(roomId, 0);
};

const closeBlackoutLog = () => {
  showBlackoutLogModal.value = false;
  blackoutLogs.value = [];
  blackoutRoomId.value = null;
};


/* 블랙아웃 생성 */
const createBlackout = async () => {
  try {
    const res = await api.post("/admin/blackout",
      newBlackout.value,
      { headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } }
    );
    if (res.data.success) {
      alert("블랙아웃 생성 성공 🎉");
      closeBlackoutCreateModal();
      fetchBlackouts();
    }
  } catch (err) {
    alert("블랙아웃 생성 실패 ❌");
  }
};

/* 블랙아웃 삭제 */
const deleteBlackout = async (id) => {
  if (!confirm("정말 이 블랙아웃을 제거하시겠습니까?")) return;
  try {
    const res = await api.delete(`/admin/blackout/${id}`, {
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` }
    });
    if (res.data.success) {
      alert("블랙아웃 제거 성공 🎉");
      fetchBlackouts(blackoutPage.value);
    }
  } catch (err) {
    alert("블랙아웃 제거 실패 ❌");
  }
};

/* 모달 닫기 */
const closeBlackoutCreateModal = () => {
  showBlackoutCreateModal.value = false;
  newBlackout.value = { scope: "ROOM", roomId: null, reason: "", startAt: "", endAt: "" };
};



/* 예약 목록 조회 */
const fetchReservations = async (p = 0) => {
  try {
    const res = await api.get("/admin/reservation", {
      params: {
        id: null, // 특정 방 조회 시 roomId 넘겨주면 됨
        memberEmail: reservationEmail.value || null,
        status: reservationStatus.value || null,
        page: p
      },
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` }
    });
    if (res.data.success) {
      reservations.value = res.data.data.content;
      reservationPage.value = res.data.data.page;
      reservationTotalPages.value = res.data.data.totalPages;
    }
  } catch (err) {
    alert("예약 목록 불러오기 실패 ❌");
  }
};

/* 예약 취소 */
const cancelReservation = async (id) => {
  if (!confirm("정말 예약을 취소하시겠습니까?")) return;
  try {
    const res = await api.delete(`/admin/reservations/${id}`, {
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
    });
    if (res.data.success) {
      alert(res.data.data.message || "예약 취소 성공 🎉");
      fetchReservations(reservationPage.value);
    }
  } catch {
    alert("예약 취소 실패 ❌");
  }
};

/* 상태 텍스트 변환 */
const statusText = (status) => {
  switch (status) {
    case "CONFIRMED": return "예약중";
    case "COMPLETED": return "완료";
    case "CANCELLED": return "취소됨";
    default: return status;
  }
};


import { watch } from "vue";

watch(activeMenu, (newMenu) => {
  if (newMenu === "members") fetchMembers();
  if (newMenu === "rooms") fetchRooms();
  if (newMenu === "reservations") fetchReservations();
  if (newMenu === "blackouts") fetchBlackouts();   // 🔹 추가
});


/* ===== 수정 모달 ===== */
const showUpdateModal = ref(false);
const updateRoomId = ref(null);
const updateRoomData = ref({
  name: "",
  capacity: null,
  openTime: "",
  closeTime: ""
});

const openUpdateModal = (room) => {
  updateRoomId.value = room.roomId;
  updateRoomData.value = {
    name: room.name,
    capacity: room.capacity,
    openTime: room.openTime.substring(0, 5),   // "09:00:00" → "09:00"
    closeTime: room.closeTime.substring(0, 5)  // "22:00:00" → "22:00"
  };
  showUpdateModal.value = true;
};

const closeUpdateModal = () => {
  showUpdateModal.value = false;
  updateRoomId.value = null;
};

const updateRoom = async () => {
  try {
    const res = await api.put(
      `/admin/rooms/${updateRoomId.value}`,
      updateRoomData.value,
      { headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } }
    );
    if (res.data.success) {
      alert(res.data.data.message || "스터디룸 수정 성공 🎉");
      closeUpdateModal();
      fetchRooms();
    }
  } catch {
    alert("스터디룸 수정 실패 ❌");
  }
};

const fetchMembers = async (p = 0) => {
  try {
    const res = await api.get("/admin/members", {
      params: {
        name: searchName.value,
        email: searchEmail.value,
        sortType: sortType.value,
        page: p,
      },
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
    });

    if (res.data.success) {
      members.value = res.data.data.content;
      page.value = res.data.data.page;
      totalPages.value = res.data.data.totalPages;
    }
  } catch (err) {
    alert("회원 목록 불러오기 실패 ❌");
  }
};

/* ===== 스터디룸 생성 모달 ===== */
const showCreateModal = ref(false);
const newRoom = ref({
  name: "",
  capacity: null,
  openTime: "",
  closeTime: ""
});

/* 모달 닫기 */
const closeCreateModal = () => {
  showCreateModal.value = false;
  newRoom.value = { name: "", capacity: null, openTime: "", closeTime: "" };
};

/* 스터디룸 생성 */
const createRoom = async () => {
  try {
    const res = await api.post("/admin/rooms",
      newRoom.value,
      { headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } }
    );
    if (res.data.success) {
      alert(res.data.data.message || "스터디룸 생성 성공 🎉");
      closeCreateModal();
      fetchRooms(); // 새로고침
    }
  } catch (err) {
    alert("스터디룸 생성 실패 ❌");
  }
};

/* 스터디룸 삭제 */
const deleteRoom = async (id) => {
  if (!confirm("정말 이 스터디룸을 삭제하시겠습니까?")) return;
  try {
    const res = await api.delete(`/admin/rooms/${id}`, {
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` }
    });
    if (res.data.success) {
      alert(res.data.data.message || "스터디룸 삭제 성공 🎉");
      fetchRooms();
    }
  } catch {
    alert("스터디룸 삭제 실패 ❌");
  }
};


const rooms = ref([]);

/* 스터디룸 목록 조회 */
const fetchRooms = async () => {
  try {
    const res = await api.get("/rooms", {
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
    });
    if (res.data.success) {
      rooms.value = res.data.data;
    }
  } catch (err) {
    alert("스터디룸 목록 불러오기 실패 ❌");
  }
};


onMounted(() => {
  if (activeMenu.value === "members") {
    fetchMembers();
  } else if (activeMenu.value === "rooms") {
    fetchRooms();
  } else if (activeMenu.value === "reservations") {
    fetchReservations();
  } else if (activeMenu.value === "blackouts") {   // 🔹 추가
    fetchBlackouts();
  }
});



const selectedMember = ref(null);

/* 회원 상세보기 */
const getMemberInfo = async (id) => {
  try {
    const res = await api.get(`/admin/members/${id}`, {
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
    });
    if (res.data.success) {
      selectedMember.value = res.data.data;
    }
  } catch {
    alert("회원 상세 불러오기 실패 ❌");
  }
};

/* 회원 삭제 */
const deleteMember = async (id) => {
  if (!confirm("정말 이 회원을 삭제하시겠습니까?")) return;
  try {
    const res = await api.delete(`/admin/members/${id}`, {
      headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
    });
    if (res.data.success) {
      alert(res.data.data.message || "회원 삭제 성공 🎉");
      fetchMembers(page.value); // 새로고침
    }
  } catch {
    alert("회원 삭제 실패 ❌");
  }
};

</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 100px auto;
  padding: 20px;
}
.title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.dashboard {
  display: flex;
  gap: 20px;
}
.sidebar {
  width: 200px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar li {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.sidebar li.active {
  background: #42b883;
  color: #fff;
  font-weight: bold;
}
.content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
}
.member-table th,
.member-table td {
  padding: 10px;
  border: 1px solid #ddd;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.page-btn {
  margin: 0 4px;
  padding: 6px 12px;
  border: 1px solid #2eb84c;
  border-radius: 4px;
  background: #fff;
  color: #2eb84c;
  cursor: pointer;
}
.page-btn.active {
  background: #2eb84c;
  color: #fff;
  font-weight: bold;
}
.page-btn:hover {
  background: #39fc7a;
  color: #fff;
}

.detail-btn, .delete-btn {
  padding: 6px 10px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.detail-btn {
  background-color: #26ae58;
  color: white;
}
.detail-btn:hover {
  background-color: #12ff69;
}

.delete-btn {
  background-color: #ff0000;
  color: white;
}
.delete-btn:hover {
  background-color: #f58d8d;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}
.close-btn {
  margin-top: 15px;
  padding: 8px 14px;
  background: #555;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.close-btn:hover {
  background: #333;
}

.room-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.room-table th,
.room-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}
.room-table th {
  background: #f5f5f5;
}
.available {
  color: green;
  font-weight: bold;
}
.unavailable {
  color: red;
  font-weight: bold;
}
.room-actions {
  margin-bottom: 15px;
  text-align: right;
}

.create-btn {
  padding: 8px 14px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.create-btn:hover {
  background-color: #369c6d;
}

/* 모달 내부 input */
.form-group {
  margin-bottom: 15px;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}
.confirm-btn {
  padding: 8px 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}
.confirm-btn:hover {
  background: #369c6d;
}
.cancel-btn {
  padding: 8px 14px;
  background: #eee;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.cancel-btn:hover {
  background: #ddd;
}
/* 모달 공통 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal.modern {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  width: 450px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #2c3e50;
  border-bottom: 2px solid #42b883;
  padding-bottom: 10px;
}

/* 폼 그룹 */
.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  gap: 12px;
}

label {
  font-size: 14px;
  font-weight: bold;
  color: #555;
  margin-bottom: 6px;
}

.input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border 0.2s, box-shadow 0.2s;
}

.input:focus {
  border-color: #42b883;
  box-shadow: 0 0 4px rgba(66, 184, 131, 0.4);
  outline: none;
}

/* 버튼 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #42b883;
  color: #fff;
}
.btn-primary:hover {
  background: #369c6d;
}

.btn-secondary {
  background: #eee;
  color: #333;
}
.btn-secondary:hover {
  background: #ddd;
}

.reservation-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.reservation-table th,
.reservation-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}
.reservation-table th {
  background: #f5f5f5;
}

.confirmed { color: green; font-weight: bold; }
.completed { color: blue; font-weight: bold; }
.cancelled { color: red; font-weight: bold; }


.log-btn {
  padding: 6px 10px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background-color: #77b22e;
  color: white;
}
.log-btn:hover {
  background-color: #6fd680;
}

.modal.wide {
  width: 800px; /* 예약 로그는 넓게 */
  max-height: 90vh;
  overflow-y: auto;
}

.blackout-btn {
  padding: 6px 10px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background-color: #615d6a; 
  color: white;
}
.blackout-btn:hover {
  background-color: #979698;
}

/* 블랙아웃 모달만 조금 더 예쁘게 */
.modal.wide {
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #2c3e50;
  border-bottom: 2px solid #42b883;
  padding-bottom: 10px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
}

.input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.input:focus {
  border-color: #42b883;
  box-shadow: 0 0 5px rgba(66, 184, 131, 0.3);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.btn-primary {
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: bold;
  cursor: pointer;
}

.btn-primary:hover {
  background: #369c6d;
}

.btn-secondary {
  background: #eee;
  color: #333;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #ddd;
}


/* 애니메이션 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}


</style>
