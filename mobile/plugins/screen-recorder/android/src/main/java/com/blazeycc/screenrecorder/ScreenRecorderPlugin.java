package com.blazeycc.screenrecorder;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.MediaRecorder;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Environment;
import android.util.DisplayMetrics;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@CapacitorPlugin(name = "ScreenRecorder")
public class ScreenRecorderPlugin extends Plugin {
    private static final int REQUEST_CODE = 1001;
    private static final String TAG = "ScreenRecorder";

    private MediaProjectionManager projectionManager;
    private MediaProjection mediaProjection;
    private VirtualDisplay virtualDisplay;
    private MediaRecorder mediaRecorder;
    private String outputPath;
    private int screenDensity;
    private int screenWidth;
    private int screenHeight;
    private boolean isRecording = false;

    // Recording options from startRecording call
    private int optVideoBitrate = 8 * 1000 * 1000;
    private int optFrameRate = 30;
    private String optFormat = "mp4";

    @Override
    public void load() {
        projectionManager = (MediaProjectionManager) getContext().getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        DisplayMetrics metrics = new DisplayMetrics();
        getActivity().getWindowManager().getDefaultDisplay().getMetrics(metrics);
        screenDensity = metrics.densityDpi;
        screenWidth = metrics.widthPixels;
        screenHeight = metrics.heightPixels;
    }

    @PluginMethod
    public void startRecording(PluginCall call) {
        if (isRecording) {
            call.reject("Already recording");
            return;
        }

        // Parse options
        Integer bitrate = call.getInt("videoBitrate");
        Integer fps = call.getInt("frameRate");
        String format = call.getString("format");
        String quality = call.getString("quality");

        if (bitrate != null && bitrate > 0) {
            optVideoBitrate = bitrate;
        } else if (quality != null) {
            optVideoBitrate = qualityToBitrate(quality);
        } else {
            optVideoBitrate = 8 * 1000 * 1000;
        }

        if (fps != null && fps > 0) {
            optFrameRate = fps;
        } else {
            optFrameRate = 30;
        }

        if (format != null && (format.equals("mp4") || format.equals("webm"))) {
            optFormat = format;
        } else {
            optFormat = "mp4";
        }

        Intent intent = projectionManager.createScreenCaptureIntent();
        startActivityForResult(call, intent, REQUEST_CODE);
    }

    private int qualityToBitrate(String quality) {
        switch (quality) {
            case "low":    return 2_000_000;
            case "medium": return 5_000_000;
            case "high":   return 8_000_000;
            case "ultra":  return 15_000_000;
            default:       return 5_000_000;
        }
    }

    @PluginMethod
    public void stopRecording(PluginCall call) {
        if (!isRecording) {
            call.reject("Not recording");
            return;
        }

        String savedPath = outputPath;
        try {
            mediaRecorder.stop();
        } catch (RuntimeException e) {
            Log.w(TAG, "RuntimeException on stop (no data recorded)", e);
            try { new File(savedPath).delete(); } catch (Exception ignored) {}
            isRecording = false;
            cleanupRecorder();
            call.reject("Recording too short — no data captured. Record for at least 2 seconds.");
            return;
        }

        try {
            mediaRecorder.reset();
            virtualDisplay.release();
            mediaProjection.stop();
            isRecording = false;

            JSObject result = new JSObject();
            result.put("path", savedPath);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Stop recording failed", e);
            isRecording = false;
            cleanupRecorder();
            call.reject(e.getMessage());
        }
    }

    private void cleanupRecorder() {
        try { if (virtualDisplay != null) virtualDisplay.release(); } catch (Exception ignored) {}
        try { if (mediaProjection != null) mediaProjection.stop(); } catch (Exception ignored) {}
        try { if (mediaRecorder != null) mediaRecorder.reset(); } catch (Exception ignored) {}
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);

        if (requestCode == REQUEST_CODE) {
            PluginCall savedCall = getSavedCall();
            if (savedCall == null) return;

            if (resultCode != Activity.RESULT_OK) {
                savedCall.reject("Screen capture permission denied");
                return;
            }

            mediaProjection = projectionManager.getMediaProjection(resultCode, data);
            if (mediaProjection == null) {
                savedCall.reject("MediaProjection is null");
                return;
            }

            try {
                setupMediaRecorder();
                virtualDisplay = mediaProjection.createVirtualDisplay(
                    "BlazeyccRecorder",
                    screenWidth, screenHeight, screenDensity,
                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                    mediaRecorder.getSurface(), null, null
                );
                mediaRecorder.start();
                isRecording = true;

                JSObject result = new JSObject();
                result.put("started", true);
                savedCall.resolve(result);
            } catch (Exception e) {
                Log.e(TAG, "Start recording failed", e);
                savedCall.reject(e.getMessage());
            }
        }
    }

    private void setupMediaRecorder() throws IOException {
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File dir = new File(getContext().getExternalFilesDir(Environment.DIRECTORY_MOVIES), "Blazeycc");
        if (!dir.exists()) dir.mkdirs();

        String ext = optFormat.equals("webm") ? ".webm" : ".mp4";
        outputPath = new File(dir, "REC_" + timestamp + ext).getAbsolutePath();

        mediaRecorder = new MediaRecorder();
        mediaRecorder.setVideoSource(MediaRecorder.VideoSource.SURFACE);
        mediaRecorder.setAudioSource(MediaRecorder.AudioSource.MIC);

        if (optFormat.equals("webm")) {
            mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.WEBM);
            mediaRecorder.setVideoEncoder(MediaRecorder.VideoEncoder.VP8);
        } else {
            mediaRecorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4);
            mediaRecorder.setVideoEncoder(MediaRecorder.VideoEncoder.H264);
        }

        mediaRecorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC);
        mediaRecorder.setVideoEncodingBitRate(optVideoBitrate);
        mediaRecorder.setVideoFrameRate(optFrameRate);
        mediaRecorder.setVideoSize(screenWidth, screenHeight);
        mediaRecorder.setOutputFile(outputPath);
        mediaRecorder.prepare();
    }
}
