package com.happynatsu.happygenstudio;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(true);

            // Strip "; wv" and "Version/X.X" so Google OAuth doesn't block with disallowed_useragent
            String defaultUserAgent = settings.getUserAgentString();
            if (defaultUserAgent != null) {
                String cleanUserAgent = defaultUserAgent
                    .replace("; wv", "")
                    .replaceAll("Version\\/\\d+\\.\\d+\\s?", "");
                settings.setUserAgentString(cleanUserAgent);
            }
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Keep WebView JavaScript timers active so background generation requests complete
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().resumeTimers();
        }
    }
}
