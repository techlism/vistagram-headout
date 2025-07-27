import { validateRequest } from "@/lib/auth"

export default async function Posts() {
    const userDetails = await validateRequest();
    if (userDetails) {
        return (
            <div>
                <p>
                    {JSON.stringify(userDetails)}
                </p>
            </div>
        )
    }
    return (
        <div>
            You are not signed in
        </div>
    )
}