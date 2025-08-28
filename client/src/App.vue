<script setup lang="ts">
import { io } from "socket.io-client";
import { onMounted, ref } from "vue";

const socket = io("http://localhost:3000");
socket.connect();

const localVideo = ref<HTMLVideoElement | null>(null);
const remoteVideo = ref<HTMLVideoElement | null>(null);

onMounted(async () => {
    if (!localVideo.value) return;
    localVideo.value.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
});
</script>

<template>
    <h1 class="text-center text-5xl mt-10">Simple WebRTC demo</h1>
    <div class="flex justify-center items-center gap-5 mt-20">
        <video
            autoplay
            playsinline
            muted
            ref="localVideo"
            class="w-[400px] h-[250px] bg-gray-200"
        ></video>
        <video
            autoplay
            playsinline
            ref="remoteVideo"
            class="w-[400px] h-[250px] bg-gray-200"
        ></video>
    </div>
</template>
