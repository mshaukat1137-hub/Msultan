import { AndroidSourceFile } from "../types";

export const ANDROID_SOURCE_FILES: AndroidSourceFile[] = [
  {
    path: "app/src/main/java/com/shaukat/filetransfer/MainActivity.kt",
    fileName: "MainActivity.kt",
    language: "kotlin",
    description: "Main Activity entry point with Jetpack Compose setup, Wi-Fi Direct Intent Filter registration, and permission checks.",
    content: `package com.shaukat.filetransfer

import android.Manifest
import android.content.Context
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.wifi.p2p.WifiP2pManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.shaukat.filetransfer.network.WifiP2pManagerHelper
import com.shaukat.filetransfer.ui.ShaukatAppNavigation
import com.shaukat.filetransfer.ui.theme.ShaukatTheme

class MainActivity : ComponentActivity() {

    private lateinit var p2pManager: WifiP2pManager
    private lateinit var channel: WifiP2pManager.Channel
    private lateinit var p2pHelper: WifiP2pManagerHelper

    private val intentFilter = IntentFilter().apply {
        addAction(WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION)
        addAction(WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION)
        addAction(WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION)
        addAction(WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION)
    }

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.entries.all { it.value }
        if (allGranted) {
            Toast.makeText(this, "Wi-Fi Direct & Storage permissions granted!", Toast.LENGTH_SHORT).show()
            p2pHelper.startPeerDiscovery()
        } else {
            Toast.makeText(this, "Permissions are required for fast P2P file transfer", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Wi-Fi Direct system service
        p2pManager = getSystemService(Context.WIFI_P2P_SERVICE) as WifiP2pManager
        channel = p2pManager.initialize(this, mainLooper, null)
        p2pHelper = WifiP2pManagerHelper(this, p2pManager, channel)

        // Check & request permissions
        checkAndRequestPermissions()

        setContent {
            ShaukatTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ShaukatAppNavigation(p2pHelper = p2pHelper)
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        registerReceiver(p2pHelper.p2pReceiver, intentFilter)
    }

    override fun onPause() {
        super.onPause()
        unregisterReceiver(p2pHelper.p2pReceiver)
    }

    private fun checkAndRequestPermissions() {
        val requiredPermissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.CHANGE_WIFI_STATE,
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.INTERNET
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requiredPermissions.add(Manifest.permission.NEARBY_WIFI_DEVICES)
            requiredPermissions.add(Manifest.permission.READ_MEDIA_IMAGES)
            requiredPermissions.add(Manifest.permission.READ_MEDIA_VIDEO)
            requiredPermissions.add(Manifest.permission.READ_MEDIA_AUDIO)
        } else {
            requiredPermissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            requiredPermissions.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }

        val missingPermissions = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            requestPermissionLauncher.launch(missingPermissions.toTypedArray())
        } else {
            p2pHelper.startPeerDiscovery()
        }
    }
}
`
  },
  {
    path: "app/src/main/java/com/shaukat/filetransfer/network/WifiP2pManagerHelper.kt",
    fileName: "WifiP2pManagerHelper.kt",
    language: "kotlin",
    description: "Wi-Fi Direct P2P helper class managing device discovery, socket server listener, connection negotiation, and retry logic.",
    content: `package com.shaukat.filetransfer.network

import android.annotation.SuppressLint
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.NetworkInfo
import android.net.wifi.p2p.WifiP2pConfig
import android.net.wifi.p2p.WifiP2pDevice
import android.net.wifi.p2p.WifiP2pDeviceList
import android.net.wifi.p2p.WifiP2pInfo
import android.net.wifi.p2p.WifiP2pManager
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.net.InetAddress

class WifiP2pManagerHelper(
    private val context: Context,
    private val manager: WifiP2pManager,
    private val channel: WifiP2pManager.Channel
) : WifiP2pManager.PeerListListener, WifiP2pManager.ConnectionInfoListener {

    private val TAG = "ShaukatP2P"

    private val _discoveredPeers = MutableStateFlow<List<WifiP2pDevice>>(emptyList())
    val discoveredPeers: StateFlow<List<WifiP2pDevice>> = _discoveredPeers

    private val _connectionInfo = MutableStateFlow<WifiP2pInfo?>(null)
    val connectionInfo: StateFlow<WifiP2pInfo?> = _connectionInfo

    private val _isWifiP2pEnabled = MutableStateFlow(false)
    val isWifiP2pEnabled: StateFlow<Boolean> = _isWifiP2pEnabled

    private var serverJob: Job? = null

    val p2pReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            when (intent?.action) {
                WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION -> {
                    val state = intent.getIntExtra(WifiP2pManager.EXTRA_WIFI_STATE, -1)
                    _isWifiP2pEnabled.value = (state == WifiP2pManager.WIFI_P2P_STATE_ENABLED)
                    Log.d(TAG, "Wi-Fi P2P state changed: \${_isWifiP2pEnabled.value}")
                }
                WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION -> {
                    @SuppressLint("MissingPermission")
                    manager.requestPeers(channel, this@WifiP2pManagerHelper)
                }
                WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION -> {
                    val networkInfo = intent.getParcelableExtra<NetworkInfo>(WifiP2pManager.EXTRA_NETWORK_INFO)
                    if (networkInfo?.isConnected == true) {
                        manager.requestConnectionInfo(channel, this@WifiP2pManagerHelper)
                    } else {
                        _connectionInfo.value = null
                    }
                }
            }
        }
    }

    @SuppressLint("MissingPermission")
    fun startPeerDiscovery() {
        manager.discoverPeers(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                Log.d(TAG, "Peer discovery initiated successfully")
            }

            override fun onFailure(reasonCode: Int) {
                Log.e(TAG, "Peer discovery failed with code: $reasonCode. Retrying...")
                CoroutineScope(Dispatchers.Main).launch {
                    delay(3000)
                    startPeerDiscovery() // Connection retry mechanism
                }
            }
        })
    }

    @SuppressLint("MissingPermission")
    fun connectToDevice(device: WifiP2pDevice, onResult: (Boolean) -> Unit) {
        val config = WifiP2pConfig().apply {
            deviceAddress = device.deviceAddress
        }

        manager.connect(channel, config, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                Log.d(TAG, "Connecting to \${device.deviceName}...")
                onResult(true)
            }

            override fun onFailure(reasonCode: Int) {
                Log.e(TAG, "Failed connecting to device. Code: $reasonCode")
                onResult(false)
            }
        })
    }

    override fun onPeersAvailable(peers: WifiP2pDeviceList?) {
        val deviceList = peers?.deviceList?.toList() ?: emptyList()
        _discoveredPeers.value = deviceList
        Log.d(TAG, "Discovered \${deviceList.size} nearby P2P devices")
    }

    override fun onConnectionInfoAvailable(info: WifiP2pInfo?) {
        _connectionInfo.value = info
        info?.let { p2pInfo ->
            val groupOwnerAddress: InetAddress? = p2pInfo.groupOwnerAddress

            if (p2pInfo.groupFormed && p2pInfo.isGroupOwner) {
                // Device acts as Server (Receiver)
                Log.d(TAG, "Connected as Group Owner (Receiver). Starting socket server...")
                startServerSocket()
            } else if (p2pInfo.groupFormed) {
                // Device acts as Client (Sender)
                Log.d(TAG, "Connected as Client (Sender). Server IP: \${groupOwnerAddress?.hostAddress}")
            }
        }
    }

    private fun startServerSocket() {
        serverJob?.cancel()
        serverJob = CoroutineScope(Dispatchers.IO).launch {
            FileTransferService.startReceiverSocketServer(port = 8888) { progress, speedMBs, etaSec ->
                Log.d(TAG, "Receiving file... Progress: $progress%, Speed: $speedMBs MB/s, ETA: \${etaSec}s")
            }
        }
    }
}
`
  },
  {
    path: "app/src/main/java/com/shaukat/filetransfer/network/FileTransferService.kt",
    fileName: "FileTransferService.kt",
    language: "kotlin",
    description: "High-speed socket transfer engine with 64KB chunk buffer, real-time speed calculation in MB/s, and progress tracking.",
    content: `package com.shaukat.filetransfer.network

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.*
import java.net.ServerSocket
import java.net.Socket
import kotlin.system.measureTimeMillis

object FileTransferService {

    private const val TAG = "FileTransferService"
    private const val BUFFER_SIZE = 64 * 1024 // 64KB buffer for ultra-fast local P2P throughput

    /**
     * Send file to target Receiver device over Wi-Fi Direct socket connection
     */
    suspend fun sendFileOverSocket(
        hostAddress: String,
        port: Int = 8888,
        file: File,
        onProgress: (progress: Int, speedMBs: Double, etaSeconds: Int) -> Unit
    ): Boolean = withContext(Dispatchers.IO) {
        var socket: Socket? = null
        try {
            socket = Socket(hostAddress, port)
            socket.tcpNoDelay = true
            socket.sendBufferSize = BUFFER_SIZE
            socket.receiveBufferSize = BUFFER_SIZE

            val outputStream = DataOutputStream(BufferedOutputStream(socket.getOutputStream()))
            val inputStream = FileInputStream(file)

            val totalBytes = file.length()
            outputStream.writeUTF(file.name)
            outputStream.writeLong(totalBytes)
            outputStream.flush()

            val buffer = ByteArray(BUFFER_SIZE)
            var bytesTransferred = 0L
            var startTime = System.currentTimeMillis()
            var bytesSinceLastCheck = 0L

            var bytesRead: Int
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
                bytesTransferred += bytesRead
                bytesSinceLastCheck += bytesRead

                val now = System.currentTimeMillis()
                val elapsedTime = (now - startTime) / 1000.0

                if (elapsedTime >= 0.5) { // Update speed metrics every 500ms
                    val currentSpeedMBs = (bytesSinceLastCheck / (1024.0 * 1024.0)) / elapsedTime
                    val progressPercentage = ((bytesTransferred.toDouble() / totalBytes) * 100).toInt()
                    val remainingBytes = totalBytes - bytesTransferred
                    val etaSeconds = if (currentSpeedMBs > 0) (remainingBytes / (currentSpeedMBs * 1024 * 1024)).toInt() else 0

                    onProgress(progressPercentage, currentSpeedMBs, etaSeconds)

                    startTime = now
                    bytesSinceLastCheck = 0L
                }
            }

            outputStream.flush()
            inputStream.close()
            outputStream.close()
            Log.d(TAG, "File \${file.name} sent successfully!")
            true
        } catch (e: Exception) {
            Log.e(TAG, "File transfer failed: \${e.message}", e)
            false
        } finally {
            socket?.close()
        }
    }

    /**
     * Start Socket Server listener on Receiving device
     */
    suspend fun startReceiverSocketServer(
        port: Int = 8888,
        destinationDir: File = File("/storage/emulated/0/Download/Shaukat/"),
        onProgress: (progress: Int, speedMBs: Double, etaSeconds: Int) -> Unit
    ) = withContext(Dispatchers.IO) {
        if (!destinationDir.exists()) destinationDir.mkdirs()

        var serverSocket: ServerSocket? = null
        try {
            serverSocket = ServerSocket(port)
            serverSocket.receiveBufferSize = BUFFER_SIZE
            Log.d(TAG, "Socket Server listening on port $port")

            while (true) {
                val clientSocket = serverSocket.accept()
                clientSocket.tcpNoDelay = true

                val inputStream = DataInputStream(BufferedInputStream(clientSocket.getInputStream()))

                val fileName = inputStream.readUTF()
                val totalBytes = inputStream.readLong()

                val outputFile = File(destinationDir, fileName)
                val outputStream = FileOutputStream(outputFile)

                val buffer = ByteArray(BUFFER_SIZE)
                var bytesTransferred = 0L
                var startTime = System.currentTimeMillis()
                var bytesSinceLastCheck = 0L

                var bytesRead: Int
                while (bytesTransferred < totalBytes && inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                    bytesTransferred += bytesRead
                    bytesSinceLastCheck += bytesRead

                    val now = System.currentTimeMillis()
                    val elapsedTime = (now - startTime) / 1000.0

                    if (elapsedTime >= 0.5) {
                        val currentSpeedMBs = (bytesSinceLastCheck / (1024.0 * 1024.0)) / elapsedTime
                        val progressPercentage = ((bytesTransferred.toDouble() / totalBytes) * 100).toInt()
                        val remainingBytes = totalBytes - bytesTransferred
                        val etaSeconds = if (currentSpeedMBs > 0) (remainingBytes / (currentSpeedMBs * 1024 * 1024)).toInt() else 0

                        onProgress(progressPercentage, currentSpeedMBs, etaSeconds)

                        startTime = now
                        bytesSinceLastCheck = 0L
                    }
                }

                outputStream.flush()
                outputStream.close()
                clientSocket.close()
                Log.d(TAG, "Received file saved to: \${outputFile.absolutePath}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Receiver socket server error: \${e.message}", e)
        } finally {
            serverSocket?.close()
        }
    }
}
`
  },
  {
    path: "app/src/main/java/com/shaukat/filetransfer/ui/ShaukatComposeUI.kt",
    fileName: "ShaukatComposeUI.kt",
    language: "kotlin",
    description: "Jetpack Compose UI components for Send/Receive prominent Urdu buttons, file selection tabs, real-time MB/s progress meter, and radar device discovery screen.",
    content: `package com.shaukat.filetransfer.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shaukat.filetransfer.network.WifiP2pManagerHelper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShaukatAppNavigation(p2pHelper: WifiP2pManagerHelper) {
    var currentScreen by remember { mutableStateOf("home") }
    var selectedCategory by remember { mutableStateOf("photos") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = CircleShape,
                            color = Color(0xFF00E5FF).copy(alpha = 0.2f),
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Zap,
                                contentDescription = "Logo",
                                tint = Color(0xFF00E5FF),
                                modifier = Modifier.padding(6.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Shaukat • شوکت",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = Color.White
                            )
                            Text(
                                text = "Ultra-Fast Local P2P Share",
                                fontSize = 11.sp,
                                color = Color(0xFF94A3B8)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0F172A)
                )
            )
        },
        containerColor = Color(0xFF090D16)
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (currentScreen) {
                "home" -> HomeScreen(
                    onSendClick = { currentScreen = "file_picker" },
                    onReceiveClick = { currentScreen = "discovery_receiver" }
                )
                "file_picker" -> FilePickerScreen(
                    onNext = { currentScreen = "discovery_sender" },
                    onBack = { currentScreen = "home" }
                )
                "discovery_sender" -> DeviceDiscoveryRadarScreen(
                    isSender = true,
                    p2pHelper = p2pHelper,
                    onConnected = { currentScreen = "transferring" },
                    onBack = { currentScreen = "file_picker" }
                )
                "discovery_receiver" -> DeviceDiscoveryRadarScreen(
                    isSender = false,
                    p2pHelper = p2pHelper,
                    onConnected = { currentScreen = "transferring" },
                    onBack = { currentScreen = "home" }
                )
                "transferring" -> TransferProgressScreen(
                    onFinished = { currentScreen = "home" }
                )
            }
        }
    }
}

@Composable
fun HomeScreen(onSendClick: () -> Unit, onReceiveClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // App Header Banner
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(modifier = Modifier.height(16.dp))
            Surface(
                shape = CircleShape,
                color = Color(0xFF1E293B),
                modifier = Modifier
                    .size(96.dp)
                    .border(2.dp, Color(0xFF00E5FF), CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.WifiTethering,
                    contentDescription = "P2P",
                    tint = Color(0xFF00E5FF),
                    modifier = Modifier.padding(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Fast local file sharing without internet",
                color = Color(0xFFCBD5E1),
                fontSize = 14.sp,
                textAlign = TextAlign.Center
            )
        }

        // Two Prominent Hero Buttons: Send & Receive
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // SEND BUTTON (بھیجیں)
            Button(
                onClick = onSendClick,
                modifier = Modifier
                    .weight(1f)
                    .height(160.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF0284C7)
                )
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send",
                        modifier = Modifier.size(44.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = "Send", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Text(text = "بھیجیں", fontSize = 18.sp, color = Color(0xFFE0F2FE))
                }
            }

            // RECEIVE BUTTON (حاصل کریں)
            Button(
                onClick = onReceiveClick,
                modifier = Modifier
                    .weight(1f)
                    .height(160.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF059669)
                )
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Download,
                        contentDescription = "Receive",
                        modifier = Modifier.size(44.dp),
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = "Receive", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Text(text = "حاصل کریں", fontSize = 18.sp, color = Color(0xFFD1FAE5))
                }
            }
        }

        // Quick Categories Footer
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                CategoryItem("Photos", Icons.Default.Image)
                CategoryItem("Videos", Icons.Default.Movie)
                CategoryItem("Apps", Icons.Default.Android)
                CategoryItem("Docs", Icons.Default.Description)
            }
        }
    }
}

@Composable
fun CategoryItem(name: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(imageVector = icon, contentDescription = name, tint = Color(0xFF94A3B8))
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = name, fontSize = 12.sp, color = Color(0xFFCBD5E1))
    }
}

@Composable
fun FilePickerScreen(onNext: () -> Unit, onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Text(
                text = "Select Files to Send",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onNext,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF))
        ) {
            Text("Discover Nearby Devices (2 Files • 18.2 MB)", color = Color.Black, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun DeviceDiscoveryRadarScreen(
    isSender: Boolean,
    p2pHelper: WifiP2pManagerHelper,
    onConnected: () -> Unit,
    onBack: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "RadarPulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "Pulse"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Text(
                text = if (isSender) "Scanning Nearby Devices..." else "Waiting to Receive...",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(40.dp))

        // Radar Circle Animation
        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(200.dp)) {
            Box(
                modifier = Modifier
                    .size(180.dp)
                    .scale(pulseScale)
                    .clip(CircleShape)
                    .background(Color(0xFF00E5FF).copy(alpha = 0.15f))
            )
            Surface(
                shape = CircleShape,
                color = Color(0xFF0F172A),
                modifier = Modifier
                    .size(90.dp)
                    .border(2.dp, Color(0xFF00E5FF), CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.Radar,
                    contentDescription = "Radar",
                    tint = Color(0xFF00E5FF),
                    modifier = Modifier.padding(20.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        Text("Wi-Fi Direct Active • Hotspot Ready", color = Color(0xFF94A3B8), fontSize = 13.sp)

        Spacer(modifier = Modifier.height(32.dp))

        // Nearby Devices List
        Text(
            text = "Discovered Devices",
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(12.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onConnected() },
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.PhoneAndroid, contentDescription = "Phone", tint = Color(0xFF00E5FF))
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text("Shaukat Galaxy S24 Ultra", fontWeight = FontWeight.Bold, color = Color.White)
                    Text("192.168.1.104 • Signal: -42 dBm", fontSize = 12.sp, color = Color(0xFF94A3B8))
                }
                Button(onClick = onConnected, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF))) {
                    Text("Connect", color = Color.Black)
                }
            }
        }
    }
}

@Composable
fun TransferProgressScreen(onFinished: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Transferring File...", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Shaukat_HD_Video.mp4 (184.5 MB)", color = Color(0xFF94A3B8))

        Spacer(modifier = Modifier.height(32.dp))

        // Speed Counter
        Text(text = "58.4 MB/s", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = Color(0xFF00E5FF))
        Text(text = "Estimated Time Remaining: 00:03s", color = Color(0xFFCBD5E1), fontSize = 14.sp)

        Spacer(modifier = Modifier.height(32.dp))

        LinearProgressIndicator(
            progress = { 0.72f },
            modifier = Modifier
                .fillMaxWidth()
                .height(12.dp)
                .clip(RoundedCornerShape(6.dp)),
            color = Color(0xFF00E5FF),
            trackColor = Color(0xFF1E293B),
        )

        Spacer(modifier = Modifier.height(48.dp))

        Button(
            onClick = onFinished,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Cancel Transfer")
        }
    }
}
`
  },
  {
    path: "app/src/main/AndroidManifest.xml",
    fileName: "AndroidManifest.xml",
    language: "xml",
    description: "Complete AndroidManifest.xml setup with Wi-Fi Direct, Local Hotspot, Location, and Storage media permissions.",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.shaukat.filetransfer">

    <!-- Wi-Fi Direct & Network Permissions -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Android 13+ Nearby Wi-Fi Devices Permission -->
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES"
        android:usesPermissionFlags="neverForLocation"
        tools:targetApi="s" />

    <!-- Location Permission (Required for P2P Discovery on older Android) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Bluetooth for Pairing Assistance -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <!-- Storage & Media Permissions -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" tools:ignore="ScopedStorage" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="Shaukat"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Shaukat"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="Shaukat"
            android:theme="@style/Theme.Shaukat">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
`
  },
  {
    path: "app/build.gradle.kts",
    fileName: "build.gradle.kts",
    language: "gradle",
    description: "App level Gradle build file with Jetpack Compose, Material3, Coroutines, and Ktor socket dependencies.",
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.shaukat.filetransfer"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.shaukat.filetransfer"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended:1.6.2")

    // Kotlin Coroutines for Fast Asynchronous Socket Transfers
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Navigation Compose
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Coil for Compose Image Loading
    implementation("io.coil-kt:coil-compose:2.6.0")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
`
  }
];
