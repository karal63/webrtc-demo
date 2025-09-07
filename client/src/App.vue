<script setup lang="ts">
import { io } from "socket.io-client";
import { onMounted, ref } from "vue";

const socket = io("http://localhost:3000");
socket.connect();
let pc: RTCPeerConnection | null = null;

const localVideo = ref<HTMLVideoElement | null>(null);
const remoteVideo = ref<HTMLVideoElement | null>(null);
let localStream: MediaStream | null = null;
const pendingCandidates: RTCIceCandidateInit[] = [];

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

const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    createPeerConnection();

    if (localStream) {
        localStream.getTracks().forEach((t) => pc?.addTrack(t, localStream!));
    }

    await pc?.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc?.createAnswer();
    await pc?.setLocalDescription(answer);

    socket.emit("answer", { answer });

    for (const c of pendingCandidates) {
        await pc!.addIceCandidate(new RTCIceCandidate(c));
    }
    pendingCandidates.length = 0;
};

const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    await pc?.setRemoteDescription(new RTCSessionDescription(answer));

    for (const c of pendingCandidates) {
        await pc?.addIceCandidate(new RTCIceCandidate(c));
    }
    pendingCandidates.length = 0;
};

const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    if (pc?.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
        pendingCandidates.push(candidate);
    }
};

onMounted(async () => {
    startLocalStream();

    socket.on("offer", ({ offer }) => {
        handleOffer(offer);
        console.log("got offer");
    });
    socket.on("answer", ({ answer }) => {
        handleAnswer(answer);
        console.log("got offer");
    });
    socket.on("candidate", ({ candidate }) => {
        handleCandidate(candidate);
        console.log("got offer");
    });
});

// CD check
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
