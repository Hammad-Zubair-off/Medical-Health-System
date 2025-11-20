# Doctor Schedule - Firestore Attributes & Data Types for FlutterFlow

## Collection: `Doctor`

### Document Structure

The doctor schedule data is stored in the `Doctor` collection. Each doctor document contains the following schedule-related fields:

---

## 1. `time_slots` (Map/Object)

**Type:** `Map` (Object/Dictionary)  
**Description:** Contains start and end times for each day of the week  
**Required:** No (Optional)

### Structure:
```json
{
  "mondayStart": Timestamp,
  "mondayEnd": Timestamp,
  "tuesdayStart": Timestamp,
  "tuesdayEnd": Timestamp,
  "wednesdayStart": Timestamp,
  "wednesdayEnd": Timestamp,
  "thursdayStart": Timestamp,
  "thursdayEnd": Timestamp,
  "fridayStart": Timestamp,
  "fridayEnd": Timestamp,
  "saturdayStart": Timestamp,
  "saturdayEnd": Timestamp,
  "sundayStart": Timestamp,
  "sundayEnd": Timestamp
}
```

### Individual Fields:

| Field Name | Data Type | Description | Notes |
|------------|-----------|-------------|-------|
| `mondayStart` | **Timestamp** | Monday start time | Use `0:00` (midnight) if not set |
| `mondayEnd` | **Timestamp** | Monday end time | Use `0:00` (midnight) if not set |
| `tuesdayStart` | **Timestamp** | Tuesday start time | Use `0:00` (midnight) if not set |
| `tuesdayEnd` | **Timestamp** | Tuesday end time | Use `0:00` (midnight) if not set |
| `wednesdayStart` | **Timestamp** | Wednesday start time | Use `0:00` (midnight) if not set |
| `wednesdayEnd` | **Timestamp** | Wednesday end time | Use `0:00` (midnight) if not set |
| `thursdayStart` | **Timestamp** | Thursday start time | Use `0:00` (midnight) if not set |
| `thursdayEnd` | **Timestamp** | Thursday end time | Use `0:00` (midnight) if not set |
| `fridayStart` | **Timestamp** | Friday start time | Use `0:00` (midnight) if not set |
| `fridayEnd` | **Timestamp** | Friday end time | Use `0:00` (midnight) if not set |
| `saturdayStart` | **Timestamp** | Saturday start time | Use `0:00` (midnight) if not set |
| `saturdayEnd` | **Timestamp** | Saturday end time | Use `0:00` (midnight) if not set |
| `sundayStart` | **Timestamp** | Sunday start time | Use `0:00` (midnight) if not set |
| `sundayEnd` | **Timestamp** | Sunday end time | Use `0:00` (midnight) if not set |

**Important Notes:**
- All time fields are **Firestore Timestamp** type
- When a day is not enabled or time is not set, store as `0:00` (midnight) for both start and end
- The date part of the Timestamp doesn't matter, only the time (hours and minutes) is used
- Example: For 9:00 AM - 5:00 PM, create Timestamps with today's date but with hours set to 9:00 and 17:00

---

## 2. `enabled_days` (Map/Object)

**Type:** `Map` (Object/Dictionary)  
**Description:** Boolean flags indicating which days of the week are enabled for appointments  
**Required:** No (Optional)

### Structure:
```json
{
  "monday": boolean,
  "tuesday": boolean,
  "wednesday": boolean,
  "thursday": boolean,
  "friday": boolean,
  "saturday": boolean,
  "sunday": boolean
}
```

### Individual Fields:

| Field Name | Data Type | Description | Default Value |
|------------|-----------|-------------|---------------|
| `monday` | **Boolean** | Monday enabled flag | `false` |
| `tuesday` | **Boolean** | Tuesday enabled flag | `false` |
| `wednesday` | **Boolean** | Wednesday enabled flag | `false` |
| `thursday` | **Boolean** | Thursday enabled flag | `false` |
| `friday` | **Boolean** | Friday enabled flag | `false` |
| `saturday` | **Boolean** | Saturday enabled flag | `false` |
| `sunday` | **Boolean** | Sunday enabled flag | `false` |

**Important Notes:**
- If a day is `false`, the doctor is not available on that day
- If a day is `true` but times are `0:00`, it means the day is enabled but no specific time is set
- Both `enabled_days` and `time_slots` should be updated together for consistency

---

## 3. `holidays` (Array)

**Type:** `Array` (List)  
**Description:** List of holidays when the doctor is not available  
**Required:** No (Optional)  
**Default:** Empty array `[]`

### Array Item Structure:

Each item in the `holidays` array is a **Map/Object** with the following structure:

```json
{
  "id": "string",
  "date": Timestamp,
  "reason": "string"
}
```

### Holiday Object Fields:

| Field Name | Data Type | Description | Required |
|------------|-----------|-------------|----------|
| `id` | **String** | Unique identifier for the holiday | Yes |
| `date` | **Timestamp** | The holiday date (date only, time is ignored) | Yes |
| `reason` | **String** | Reason/description for the holiday | Yes |

**Example:**
```json
[
  {
    "id": "holiday-1234567890",
    "date": Timestamp("2025-12-25T00:00:00Z"),
    "reason": "Christmas Day"
  },
  {
    "id": "holiday-1234567891",
    "date": Timestamp("2025-01-01T00:00:00Z"),
    "reason": "New Year's Day"
  }
]
```

**Important Notes:**
- `id` should be unique (e.g., use timestamp or UUID)
- `date` should be set to midnight (00:00:00) of the holiday date
- Only the date part matters for holiday checking, time is ignored
- When checking if a date is a holiday, compare only year, month, and day

---

## Complete Example Document Structure

```json
{
  "_id": "doctor_doc_id",
  "userid": "Reference to Users collection",
  "specialization": "Cardiology",
  "time_slots": {
    "mondayStart": Timestamp("2025-01-13T09:00:00Z"),
    "mondayEnd": Timestamp("2025-01-13T17:00:00Z"),
    "tuesdayStart": Timestamp("2025-01-13T09:00:00Z"),
    "tuesdayEnd": Timestamp("2025-01-13T17:00:00Z"),
    "wednesdayStart": Timestamp("2025-01-13T09:00:00Z"),
    "wednesdayEnd": Timestamp("2025-01-13T17:00:00Z"),
    "thursdayStart": Timestamp("2025-01-13T09:00:00Z"),
    "thursdayEnd": Timestamp("2025-01-13T17:00:00Z"),
    "fridayStart": Timestamp("2025-01-13T09:00:00Z"),
    "fridayEnd": Timestamp("2025-01-13T17:00:00Z"),
    "saturdayStart": Timestamp("2025-01-13T00:00:00Z"),
    "saturdayEnd": Timestamp("2025-01-13T00:00:00Z"),
    "sundayStart": Timestamp("2025-01-13T00:00:00Z"),
    "sundayEnd": Timestamp("2025-01-13T00:00:00Z")
  },
  "enabled_days": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": true,
    "friday": true,
    "saturday": false,
    "sunday": false
  },
  "holidays": [
    {
      "id": "holiday-1704067200000",
      "date": Timestamp("2025-01-01T00:00:00Z"),
      "reason": "New Year's Day"
    }
  ]
}
```

---

## FlutterFlow Configuration Guide

### 1. Create/Update Collection Schema

In FlutterFlow, ensure your `Doctor` collection has:

#### Field: `time_slots`
- **Type:** Map
- **Fields inside Map:**
  - `mondayStart`: Timestamp
  - `mondayEnd`: Timestamp
  - `tuesdayStart`: Timestamp
  - `tuesdayEnd`: Timestamp
  - `wednesdayStart`: Timestamp
  - `wednesdayEnd`: Timestamp
  - `thursdayStart`: Timestamp
  - `thursdayEnd`: Timestamp
  - `fridayStart`: Timestamp
  - `fridayEnd`: Timestamp
  - `saturdayStart`: Timestamp
  - `saturdayEnd`: Timestamp
  - `sundayStart`: Timestamp
  - `sundayEnd`: Timestamp

#### Field: `enabled_days`
- **Type:** Map
- **Fields inside Map:**
  - `monday`: Boolean
  - `tuesday`: Boolean
  - `wednesday`: Boolean
  - `thursday`: Boolean
  - `friday`: Boolean
  - `saturday`: Boolean
  - `sunday`: Boolean

#### Field: `holidays`
- **Type:** List (Array)
- **Item Type:** Map
- **Fields in each Map item:**
  - `id`: String
  - `date`: Timestamp
  - `reason`: String

### 2. Important Implementation Notes

1. **Time Storage:**
   - When saving times, use today's date but set the hours/minutes to the desired time
   - For "not set" times, use `0:00` (midnight)
   - Example: For 9:00 AM, create a Timestamp with current date but hour=9, minute=0

2. **Day Validation:**
   - Before creating appointments, check:
     - Is the day enabled? (`enabled_days[dayName] == true`)
     - Are times valid? (not `0:00`)
     - Is the date a holiday? (check `holidays` array)

3. **Holiday Checking:**
   - When checking if a date is a holiday, compare only the date part (year, month, day)
   - Ignore the time component of the Timestamp

4. **Default Values:**
   - If `time_slots` doesn't exist, assume all days are closed
   - If `enabled_days` doesn't exist, assume all days are `false`
   - If `holidays` doesn't exist, assume empty array `[]`

---

## Summary Table

| Field | Type | Sub-fields | Required |
|-------|------|------------|----------|
| `time_slots` | Map | 14 Timestamp fields (7 days × 2 times) | No |
| `enabled_days` | Map | 7 Boolean fields (one per day) | No |
| `holidays` | Array | Array of Maps (id, date, reason) | No |

---

## Quick Reference for FlutterFlow

### Creating a Time Slot:
```
Create a DateTime object with:
- Date: Today's date (any date works, only time matters)
- Time: Desired time (e.g., 9:00 AM)
- Convert to Firestore Timestamp
```

### Checking if Day is Available:
```
1. Check enabled_days[dayName] == true
2. Check time_slots[dayName + "Start"] != 0:00
3. Check time_slots[dayName + "End"] != 0:00
4. Check date is not in holidays array
```

### Storing "Not Set" Time:
```
Store as Timestamp with:
- Date: Today's date
- Time: 00:00:00 (midnight)
```

---

**Last Updated:** January 2025  
**Version:** 1.0

