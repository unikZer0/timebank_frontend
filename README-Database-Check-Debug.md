# Database Check Debug - Enhanced Logging

## 🚀 **Enhanced Debugging Added**

I've added comprehensive debugging to help identify why the database check isn't working for `1000000000010`. The system now includes detailed console logging to track the validation process.

## ✅ **Debug Features Added**

### **1. Database Lookup Debugging**
```typescript
// Mock citizen lookup
async function mockLookupCitizen(nationalId: string) {
  try {
    console.log('Looking up National ID in database:', nationalId);
    const response = await fetch('https://pub-f1ab9efe03eb4ce7afd952fc03688236.r2.dev/mock_thai_citizens_with_criminal.json');
    const data = await response.json();
    
    console.log('Database response:', data);
    
    if (data.success && data.data) {
      const foundCitizen = data.data.find((citizen: any) => citizen.national_id === nationalId);
      console.log('Found citizen:', foundCitizen);
      return foundCitizen;
    }
  } catch (error) {
    console.warn('Failed to fetch mock citizens data:', error);
  }
  console.log('No citizen found for National ID:', nationalId);
  return null;
}
```

### **2. Validation Flow Debugging**
```typescript
// Check if National ID is already in use in database
console.log('Starting database check for National ID:', nationalId);
const mockCitizen = await mockLookupCitizen(nationalId);

// If found in database, show "in use" message
if (mockCitizen) {
  console.log('National ID found in database:', mockCitizen);
  return {
    success: false,
    message: 'เลขบัตรประชาชนนี้มีผู้ใช้งานแล้ว',
    code: 'DUPLICATE_NATIONAL_ID'
  };
}

console.log('National ID not found in database, proceeding with validation');
```

## 🔍 **How to Debug**

### **1. Open Browser Console**
- Press `F12` or right-click → "Inspect" → "Console" tab

### **2. Enter National ID `1000000000010`**
- Watch the console for debug messages

### **3. Expected Console Output**
```
Starting database check for National ID: 1000000000010
Looking up National ID in database: 1000000000010
Database response: {success: true, data: [...]}
Found citizen: {id: 1010, first_name: "วันชนก", last_name: "ธัญาโภชน์", national_id: "1000000000010", ...}
National ID found in database: {id: 1010, first_name: "วันชนก", ...}
```

### **4. If Not Working, You'll See**
```
Starting database check for National ID: 1000000000010
Looking up National ID in database: 1000000000010
Database response: {success: true, data: [...]}
No citizen found for National ID: 1000000000010
National ID not found in database, proceeding with validation
```

## 🧪 **Test Cases**

### **National IDs That Should Show "In Use":**
- **`1000000000010`** - วันชนก ธัญาโภชน์
- **`1000000000001`** - เอกชัย ดุษฎีวนิช
- **`1000000000002`** - โสภา ดุษฎีวนิช
- **`1000000000003`** - เกษมชัย ดุษฎีวนิช

### **Expected Results:**
- ❌ **Error Message**: "เลขบัตรประชาชนนี้มีผู้ใช้งานแล้ว"
- 🔴 **Red Border**: Input field shows error state
- 📋 **Console Logs**: Detailed debugging information

## 🚀 **Next Steps**

1. **Test with `1000000000010`** and check browser console
2. **Look for debug messages** to see what's happening
3. **Report any issues** found in the console logs

The enhanced debugging will help us identify exactly where the database check is failing! 🔍
