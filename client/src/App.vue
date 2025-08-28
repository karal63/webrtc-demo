<script setup lang="ts">
import { io } from "socket.io-client";
import { onMounted, ref } from "vue";

const socket = io("http://localhost:3000");
socket.connect();
let pc: RTCPeerConnection | null = null;

const localVideo = ref<HTMLVideoElement | null>(null);
const remoteVideo = ref<HTMLVideoElement | null>(null);
let localStream: MediaStream | null = null;

const startLocalStream = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
    });
    if (!localVideo.value) return;
    localVideo.value.srcObject = localStream;
};

const createPeerConnection = () => {
    pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("candidate", { candidate: event.candidate });
        }
    };

    pc.ontrack = (event) => {
        if (remoteVideo.value) {
            remoteVideo.value.srcObject = event.streams[0];
        }
    };

    return pc;
};

const callUser = async () => {
    createPeerConnection();

    if (localStream) {
        localStream.getTracks().forEach((t) => pc?.addTrack(t, localStream!));
    }

    const offer = await pc?.createOffer();
    await pc?.setLocalDescription(offer);

    socket.emit("offer", { offer });
    console.log("calling");
};

onMounted(async () => {
    startLocalStream();

    socket.on("offer", ({ offer }) => {
        console.log("got offer");
    });
    socket.on("answer", ({ answer }) => {
        console.log("got offer");
    });
    socket.on("candidate", ({ candidate }) => {
        console.log("got offer");
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

    <div class="flex justify-center">
        <button
            @click="callUser"
            class="bg-gradient-to-br from-pink-700 to-purple-500 px-1 py-1 mt-10 rounded-md cursor-pointer"
        >
            <div class="bg-white px-4 py-1 text-lg rounded-lg cursor-pointer">
                Call
            </div>
        </button>
    </div>
</template>
