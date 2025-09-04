<template>
  <main class="main">
    <h2 class="title">스터디룸 목록</h2>
    <div class="room-list">
      <div v-for="room in rooms" :key="room.roomId" class="room-card">
        <!-- 스터디룸 이미지 -->
        <img src="@/images/studyroomImage.png" alt="스터디룸 이미지" class="room-img" />

        <h3>{{ room.name }}</h3>
        <p>정원: {{ room.capacity }}명</p>
        <p>이용시간: {{ room.openTime }} ~ {{ room.closeTime }}</p>
        <p :class="room.available ? 'available' : 'unavailable'">
          {{ room.available ? '예약 가능' : '예약 불가' }}
        </p>

        <!-- 예약 현황 버튼 -->
        <!-- 원래는 예약 현황 버튼만 있었음 -->
<div class="card-actions">
  <button class="card-btn reserve-btn" @click="openReservation(room)">예약 현황</button>
  <button class="card-btn book-btn" :disabled="!room.available" @click="openBooking(room)">
    예약하기
  </button>
</div>

      </div>
    </div>
<!-- ✅ 예약하기 모달 -->
<div v-if="showBooking" class="modal-overlay" @click.self="closeBooking">
  <div class="modal">
    <h3 class="modal-title">{{ selectedRoom.name }} 예약하기</h3>

    <div class="form-group">
      <label>시작 시간</label>
      <select v-model="bookingStartHour">
        <option v-for="h in bookingHours" :key="h" :value="h">
          {{ h }}:00
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>종료 시간</label>
      <select v-model="bookingEndHour">
        <option v-for="h in bookingHours" :key="h" :value="h" :disabled="h <= bookingStartHour">
          {{ h }}:00
        </option>
      </select>
    </div>

    <div class="modal-actions">
      <button class="confirm-btn" @click="makeReservation">예약 하기</button>
      <button class="cancel-btn" @click="closeBooking">취소</button>
    </div>
  </div>
</div>



    <!-- ✅ 예약 현황 모달 -->
    <div v-if="showReservation" class="modal-overlay" @click.self="closeReservation">
      <div class="modal">
        <h3 class="modal-title">{{ selectedRoom.name }} 예약 현황</h3>

        <!-- 시간대 바 표시 -->
        <div class="time-bars">
          <div
            v-for="slot in timeSlots"
            :key="slot.time"
            class="time-slot"
            :class="{ reserved: slot.reserved, blackout: slot.blackout }"
          >
            {{ slot.time }}:00
          </div>
        </div>

        <button class="close-btn" @click="closeReservation">닫기</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import dayjs from "dayjs"
import api from "@/api/axios";


const rooms = ref([])
const reservations = ref([])
const blackouts = ref([])
const showReservation = ref(false)
const selectedRoom = ref({})
const timeSlots = ref([])
const showBooking = ref(false)   // 예약 모달 열림 여부
const bookingStart = ref("")     // 시작 시간
const bookingEnd = ref("")       // 종료 시간
import Cookies from "js-cookie" // ✅ accessToken 읽어오기


onMounted(async () => {
  try {
    const res = await api.get("/rooms")
    if (res.data.success) {
      rooms.value = res.data.data
    }
  } catch (err) {
    console.error("스터디룸 목록 불러오기 실패", err)
  }
})

const bookingStartHour = ref(null)
const bookingEndHour = ref(null)
const bookingHours = ref([])

const openBooking = (room) => {
  selectedRoom.value = room
  bookingStartHour.value = null
  bookingEndHour.value = null

  // 운영시간 기준으로 선택 가능 시간 생성
  const startHour = parseInt(room.openTime.split(":")[0])
  const endHour = parseInt(room.closeTime.split(":")[0])
bookingHours.value = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)


  showBooking.value = true
}

const closeBooking = () => {
  showBooking.value = false
  bookingStartHour.value = null
  bookingEndHour.value = null
}


const makeReservation = async () => {
  if (bookingStartHour.value === null || bookingEndHour.value === null) {
    alert("시작/종료 시간을 선택하세요.")
    return
  }
  if (bookingEndHour.value <= bookingStartHour.value) {
    alert("종료 시간은 시작 시간보다 커야 합니다.")
    return
  }

  const today = dayjs().format("YYYY-MM-DD")
  const startAt = `${today}T${String(bookingStartHour.value).padStart(2, "0")}:00:00`
  const endAt = `${today}T${String(bookingEndHour.value).padStart(2, "0")}:00:00`
  const duration = bookingEndHour.value - bookingStartHour.value

  try {
    const res = await api.post(
      `/reservation/rooms/${selectedRoom.value.roomId}`,
      { startAt, endAt, duration },
      { headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` } }
    )

    if (res.data.success) {
      alert("예약 성공 🎉")
      closeBooking()
      openReservation(selectedRoom.value)
    }
  } catch (err) {
    console.error("예약 실패", err)
    alert("예약 실패 ❌")
  }
}

// 예약 현황 열기
const openReservation = async (room) => {
  selectedRoom.value = room

  try {
    // ✅ 예약 조회
    const res1 = await api.get(
      `/reservation/rooms/${room.roomId}`
    )
    if (res1.data.success) {
      reservations.value = res1.data.data
    }

    // ✅ 오늘 블랙아웃 조회
    const res2 = await api.get(
      `/blackout/rooms/${room.roomId}/today`
    )
    if (res2.data.success) {
      blackouts.value = res2.data.data
    }
  } catch (err) {
    console.error("예약/블랙아웃 불러오기 실패", err)
  }

  generateTimeSlots(room)
  showReservation.value = true
}

// 예약 현황 닫기
const closeReservation = () => {
  showReservation.value = false
  reservations.value = []
  blackouts.value = []
  timeSlots.value = []
}

// 시간대별 슬롯 생성 (예약 + 블랙아웃 반영)
const generateTimeSlots = (room) => {
  const slots = []
  const startHour = parseInt(room.openTime.split(":")[0])
  const endHour = parseInt(room.closeTime.split(":")[0])

  for (let h = startHour; h < endHour; h++) {
    const slotStart = dayjs().hour(h).minute(0).second(0).millisecond(0)
    const slotEnd = slotStart.add(1, "hour")

    // 예약된 구간 확인 (경계 포함)
    let isReserved = reservations.value.some(r =>
      dayjs(r.startAt).isBefore(slotEnd) && dayjs(r.endAt).isAfter(slotStart)
    )

    // 블랙아웃 구간 확인 (경계 포함)
    let isBlackout = blackouts.value.some(b =>
      dayjs(b.startAt).isBefore(slotEnd) && dayjs(b.endAt).isAfter(slotStart)
    )

    // ⚠️ 블랙아웃이 있으면 예약보다 우선
    if (isBlackout) {
      isReserved = false
    }

    slots.push({ time: h, reserved: isReserved, blackout: isBlackout })
  }

  timeSlots.value = slots
}
</script>

<style scoped>
.main {
  padding: 20px 20px 40px;
  min-height: calc(100vh - 120px);
  text-align: center;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
}

.room-list {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.room-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  width: 250px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease;
}

.room-card:hover {
  transform: translateY(-5px);
}

.room-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.available {
  color: #42b883;
  font-weight: bold;
}

.unavailable {
  color: red;
  font-weight: bold;
}

.reserve-btn {
  margin-top: 10px;
  padding: 8px 12px;
  border: none;
  background: #42b883;
  color: white;
  font-size: 14px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}
.reserve-btn:hover {
  background: #369c6d;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  max-height: 500px;
  overflow-y: auto;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
.modal-title {
  font-size: 20px;
  margin-bottom: 15px;
  text-align: center;
}
.time-bars {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
  justify-content: flex-start;
}

.time-slot {
  width: 70px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  background: #eee;
  color: #333;
}

.time-slot.reserved {
  background: #42b883; /* 초록 */
  color: white;
}

.time-slot.blackout {
  background: #e74c3c; /* 빨강 */
  color: white;
}

.close-btn {
  margin-top: 15px;
  padding: 8px 14px;
  background: #eee;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.close-btn:hover {
  background: #ddd;
}
.card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.card-btn {
  flex: 1; /* 버튼 크기 균등 */
  margin: 0 4px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease;
}

/* 예약 현황 버튼 (초록) */
.reserve-btn {
  background: #42b883;
  color: white;
}
.reserve-btn:hover {
  background: #369c6d;
}

/* 예약하기 버튼 (좀 더 진한 초록) */
.book-btn {
  background: #2f9e74;
  color: white;
}
.book-btn:hover {
  background: #237557;
}
.book-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.confirm-btn {
  padding: 10px 18px;
  font-size: 15px;    /* ✅ 글씨 크게 */
  background: #42b883;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.confirm-btn:hover {
  background: #369c6d;
}

.cancel-btn {
  padding: 10px 18px;
  font-size: 15px;
  background: #eee;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.cancel-btn:hover {
  background: #ddd;
}


.form-group {
  margin-bottom: 16px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;   /* ✅ 글씨 크기 키움 */
  font-weight: bold;
}

.form-group select {
  width: 100%;
  padding: 10px 12px;  /* ✅ 입력창 크기 키움 */
  font-size: 16px;     /* ✅ 글씨 크게 */
  border: 1px solid #ccc;
  border-radius: 6px;
}

</style>
