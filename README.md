# 🔔 Notification & Theme Hub — Angular Subjects Deep Dive

## 📌 What Did I Build?
A global toast notification system + dark/light theme toggle that works across multiple independent components — the kind of architecture you'd find in Jira, Slack, Azure DevOps, or any enterprise SaaS dashboard.

## 🏢 Real-World Scenario
In large-scale enterprise applications:
- **Toast notifications** appear when API calls succeed/fail, when background tasks complete, or when real-time events occur (WebSocket messages). The component triggering the notification is **different** from the component displaying it.
- **Theme switching** (dark/light mode) must propagate instantly to every component in the app — header, sidebar, content, modals — all at once.
- **App configuration** loads once on startup from the backend API (`GET /api/config`) and every component waits for it before rendering features.

**These are cross-component communication problems**, and Angular solves them with **Subjects + injectable services**.

## 🧠 RxJS Concepts Covered

| Subject Type | Behavior | Real-World Use |
|-------------|----------|---------------|
| **Subject** | No initial value. Late subscribers miss past emissions. | Live toast notifications — only care about toasts that happen while the component is visible |
| **BehaviorSubject** | Has initial value. Late subscribers immediately get the current value. | Theme state — new components need to know the current theme RIGHT NOW |
| **ReplaySubject(N)** | Remembers last N values. Late subscribers get replayed history. | Notification history — opening the panel shows recent notifications you missed |
| **AsyncSubject** | Only emits the LAST value, and only when complete() is called. | App config loading — components wait for the final config, not intermediate states |

### Additional Concepts
| Concept | What It Does | .NET Equivalent |
|---------|-------------|-----------------|
| **asObservable()** | Exposes a Subject as read-only Observable | `IReadOnlyList<T>` / private setter |
| **next()** | Pushes a value to all subscribers | `event?.Invoke()` / `EventAggregator.Publish()` |
| **complete()** | Signals the stream is done | `TaskCompletionSource.SetResult()` |
| **providedIn: 'root'** | Singleton service across the entire app | `services.AddSingleton<T>()` |
| **getValue()** | Synchronously read BehaviorSubject's current value | Property getter |

## 🔴 The #1 Interview Question This Covers

> **Q: What's the difference between Subject, BehaviorSubject, ReplaySubject, and AsyncSubject?**
>
> **A:** 
> - **Subject** — No initial value. Subscribers only get future emissions. Use for live events like notifications.
> - **BehaviorSubject** — Requires an initial value. New subscribers immediately receive the current value. Use for state (theme, auth status, selected language).
> - **ReplaySubject(N)** — Replays the last N values to new subscribers. Use for history/audit logs.
> - **AsyncSubject** — Only emits the last value, and only when `complete()` is called. Use for one-time async operations like config loading.

## 🔬 Interactive Comparison Demo
The app includes a "Subject Comparison" button that:
1. Creates all 4 Subject types
2. Subscribes an "early subscriber" to each
3. Pushes values A and B
4. Subscribes a "late subscriber" to each
5. Pushes value C and completes
6. Shows exactly what each subscriber received

This visualizes the interview answer in real-time.

## 🚀 How to Run

```bash
git clone https://github.com/YOUR_USERNAME/angular-notification-theme-hub.git
cd angular-notification-theme-hub
npm install
ng serve
```
Open http://localhost:4200 → trigger notifications, toggle theme, run comparison demo, and **check the browser console (F12)** to see all Subject emissions.

## 📁 Project Structure
```
src/app/
├── services/
│   ├── notification.service.ts    ← Subject + ReplaySubject
│   ├── theme.service.ts           ← BehaviorSubject
│   └── config.service.ts          ← AsyncSubject
├── components/
│   ├── header/                    ← Theme toggle + notification bell
│   ├── toast-container/           ← Live toast display (Subject consumer)
│   ├── notification-history/      ← History panel (ReplaySubject consumer)
│   └── subject-playground/        ← Interactive demo + comparison
└── app.component.ts               ← Root layout
```

## 📚 Part of Angular Mastery Series
This is **Project 2 of 14** in my Angular + RxJS learning journey covering 50+ concepts through real-world projects.

| # | Project | Status |
|---|---------|--------|
| 1 | [OTP Resend Timer](../angular-otp-timer) | ✅ Done |
| 2 | Notification & Theme Hub | ✅ Current |
| 3 | Employee Directory (CRUD) | ⏳ Next |

---
*Built while learning Angular as a .NET developer — every line is commented with C# equivalents for reference.*
